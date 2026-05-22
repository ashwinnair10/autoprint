import * as vscode from 'vscode';

const outputChannel = vscode.window.createOutputChannel("AutoPrint Debugger");

export function activate(context: vscode.ExtensionContext) {

    outputChannel.clear();
    outputChannel.show();

    const disposable = vscode.commands.registerCommand(
        'autoprint.generatePrint',
        async () => {

            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return;
            }

            const document = editor.document;
            const selection = editor.selection;
            let variable = document.getText(selection).trim();

            if (!variable) {
                const position = selection.active;
                const range = document.getWordRangeAtPosition(position);

                if (!range) {
                    vscode.window.showInformationMessage('No variable found.');
                    return;
                }
                variable = document.getText(range);
            }

            const language = document.languageId;
            const currentLine = selection.active.line;

            const lineText = document.lineAt(currentLine).text;
            const match = lineText.match(/^\s*/);
            const indentation = match ? match[0] : '';
            outputChannel.appendLine(`Detected language ID: [${language}]`);
            let cleanVariable = variable;
            if (language === 'php' || language === 'perl' || language === 'powershell') {
                cleanVariable = variable.replace(/^\$/, ''); 
            }
            const printStatement = generatePrint(language, cleanVariable, indentation);

            if (!printStatement) {
                vscode.window.showInformationMessage(`Unsupported language: ${language}`);
                return;
            }

            const isLastLine = currentLine === document.lineCount - 1;
            const insertPosition = new vscode.Position(currentLine + 1, 0);

            await editor.edit(editBuilder => {
                if (isLastLine) {
                    editBuilder.insert(new vscode.Position(currentLine, lineText.length), '\n' + printStatement);
                } else {
                    editBuilder.insert(insertPosition, printStatement + '\n');
                }
            });

            if (language === 'go') {
                const fileText = document.getText();
                
                const hasFmt = /import\s+\(\s*([\s\S]*?)"fmt"[\s\S]*?\)|import\s+"fmt"/.test(fileText);
                
                if (!hasFmt) {
                    await editor.edit(editBuilder => {
                        for (let i = 0; i < document.lineCount; i++) {
                            const line = document.lineAt(i).text;
                            if (line.startsWith('package ')) {
                                editBuilder.insert(new vscode.Position(i + 1, 0), '\nimport "fmt"\n');
                                break;
                            }
                        }
                    });
                }
            }

        }
    );

    const removeDisposable = vscode.commands.registerCommand(
        'autoprint.removePrints',
        async () => {

            const editor = vscode.window.activeTextEditor;

            if (!editor) {
                return;
            }

            const document = editor.document;
            const fullText = document.getText();
            const cleaned = fullText.replace(
                /^\s*(\/\/|#)\sAUTOPRINT.*\r?\n\s*.*\r?\n?/gm,
    ''
            );
            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(fullText.length)
            );
            await editor.edit(editBuilder => {
                editBuilder.replace(fullRange, cleaned);
            });
            vscode.window.showInformationMessage(
                'Removed AutoPrint statements.'
            );
        }
    );

    context.subscriptions.push(removeDisposable);

    context.subscriptions.push(disposable);
}

function generatePrint(
    language: string,
    variable: string,
    indentation: string
): string | null {

    switch (language) {

        case 'python':
            return `${indentation}# AUTOPRINT\n${indentation}print(f"${variable} = {${variable}}")`;

        case 'javascript':
        case 'typescript':
        case 'javascriptreact':
        case 'typescriptreact':
            return `${indentation}// AUTOPRINT\n${indentation}console.log('${variable} =', ${variable});`;

        case 'java':
            return `${indentation}// AUTOPRINT\n${indentation}System.out.println("${variable} = " + ${variable});`;

        case 'c':
            return `${indentation}// AUTOPRINT\n${indentation}printf("${variable} (debug format string warning)\\n");`;

        case 'cpp':
            return `${indentation}// AUTOPRINT\n${indentation}std::cout << "${variable} = " << ${variable} << std::endl;`;

        case 'csharp': 
            return `${indentation}// AUTOPRINT\n${indentation}Console.WriteLine($"${variable} = {${variable}}");`;

        case 'go':
            return `${indentation}// AUTOPRINT\n${indentation}fmt.Printf("${variable} = %v\\n", ${variable})`;

        case 'rust':
            return `${indentation}// AUTOPRINT\n${indentation}println!("${variable} = {:?}", ${variable});`;

        case 'php':
            return `${indentation}// AUTOPRINT\n${indentation}echo '${variable} = ' . var_export(\$${variable}, true) . "\\n";`;

        case 'ruby':
            return `${indentation}# AUTOPRINT\n${indentation}puts "${variable} = #{${variable}.inspect}"`;

        case 'swift':
            return `${indentation}// AUTOPRINT\n${indentation}print("${variable} =", ${variable})`;

        case 'kotlin':
        case 'kotlinscript':
            return `${indentation}// AUTOPRINT\n${indentation}println("${variable} = $${variable}")`;

        default:
            return null;
    }
}

export function deactivate() {}
