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
            const cleaned = fullText
                .split(/\r?\n/)
                .filter(line => !line.includes('AUTOPRINT'))
                .join('\n');
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
            return `${indentation}print(f"${variable} = {${variable}}") # AUTOPRINT`;

        case 'javascript':
        case 'typescript':
        case 'javascriptreact':
        case 'typescriptreact':
            return `${indentation}console.log('${variable} =', ${variable}); // AUTOPRINT`;

        case 'java':
            return `${indentation}System.out.println("${variable} = " + ${variable}); // AUTOPRINT`;

        case 'c':
            return `${indentation}printf("${variable} (debug format string warning)\\n"); // AUTOPRINT`;

        case 'cpp':
            return `${indentation}std::cout << "${variable} = " << ${variable} << std::endl; // AUTOPRINT`;

        case 'csharp': 
            return `${indentation}Console.WriteLine($"${variable} = {${variable}}"); // AUTOPRINT`;

        case 'go':
            return `${indentation}fmt.Printf("${variable} = %v\\n", ${variable}) // AUTOPRINT`;

        case 'rust':
            return `${indentation}println!("${variable} = {:?}", ${variable}); // AUTOPRINT`;

        case 'php':
            return `${indentation}echo '${variable} = ' . var_export(\$${variable}, true) . "\\n"; // AUTOPRINT`;

        case 'ruby':
            return `${indentation}puts "${variable} = #{${variable}.inspect}" # AUTOPRINT`;

        case 'swift':
            return `${indentation}print("${variable} =", ${variable}) // AUTOPRINT`;

        case 'kotlin':
        case 'kotlinscript':
            return `${indentation}println("${variable} = $${variable}") // AUTOPRINT`;

        default:
            return null;
    }
}

export function deactivate() {}
