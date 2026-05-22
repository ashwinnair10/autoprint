# AutoPrint

Generate debug print statements instantly for multiple programming languages in Visual Studio Code.

Place your cursor on a variable (or select one), press a shortcut, and AutoPrint inserts a language-specific debug print statement automatically.

---

# Features

- Works with cursor or selected text
- Automatically detects current language
- Preserves indentation
- Supports multiple languages
- Right-click context menu support
- Fast debug logging workflow
- Automatic `fmt` import handling for Go

---

# Supported Languages

| Language      | Generated Output                             |
| ------------- | -------------------------------------------- |
| Python        | `print(f"x = {x}")`                          |
| JavaScript    | `console.log('x =', x);`                     |
| TypeScript    | `console.log('x =', x);`                     |
| React (JS/TS) | `console.log('x =', x);`                     |
| Java          | `System.out.println("x = " + x);`            |
| C             | `printf("x = %d\n", x);`                     |
| C++           | `std::cout << "x = " << x << std::endl;`     |
| C#            | `Console.WriteLine($"x = {x}");`             |
| Go            | `fmt.Printf("x = %v\n", x)`                  |
| Rust          | `println!("x = {:?}", x);`                   |
| PHP           | `echo 'x = ' . var_export($x, true) . "\n";` |
| Ruby          | `puts "x = #{x.inspect}"`                    |
| Swift         | `print("x =", x)`                            |
| Kotlin        | `println("x = $x")`                          |

---

# Usage

## Method 1 — Cursor Mode

Place cursor on a variable:

```python
totalPrice = 499
```

Press:

```text
Ctrl + Alt + Z
```

Generated:

```python
print(f"totalPrice = {totalPrice}")
```

---

## Method 2 — Selection Mode

Select:

```js
userName;
```

Press shortcut.

Generated:

```js
console.log("userName =", userName);
```

---

# Keyboard Shortcut

| Platform        | Shortcut         |
| --------------- | ---------------- |
| Windows / Linux | `Ctrl + Alt + Z` |
| macOS           | `Cmd + Alt + Z`  |

You can customize this in VS Code Keyboard Shortcuts.

---

# Context Menu

Right click inside the editor and choose:

```text
Generate Print Statement
```

---

# Go Support

AutoPrint automatically adds:

```go
import "fmt"
```

if it does not already exist in the file.

---

# Installation

## From VSIX

1. Open VS Code
2. Go to Extensions
3. Click `...`
4. Select:

```text
Install from VSIX
```

5. Choose the generated `.vsix` file

---

# Development

## Setup

Clone repository and install dependencies:

```bash
npm install
```

---

## Compile

```bash
npm run compile
```

---

## Watch Mode

```bash
npm run watch
```

---

## Run Extension

Press:

```text
F5
```

This opens the Extension Development Host.

---

# Packaging

Install VSCE:

```bash
npm install -g @vscode/vsce
```

Generate VSIX:

```bash
vsce package
```

---

# Known Limitations

- C format specifiers are not inferred automatically yet
- Multi-cursor support is not implemented yet
- AST-aware logging is not implemented yet

---

# Planned Features

- Remove all AutoPrint logs
- Smart object logging
- Multi-variable support
- AST-aware print generation
- Configurable templates
- More language support

---

# Contributing

Pull requests and feature suggestions are welcome.

---

# License

MIT License
