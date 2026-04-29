def check_brackets(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    stack = []
    lines = content.split('\n')
    for i, line in enumerate(lines):
        for char in line:
            if char == '{':
                stack.append(i + 1)
            elif char == '}':
                if not stack:
                    print(f"Extra closing bracket at line {i + 1}")
                else:
                    stack.pop()
    
    if stack:
        print(f"Unclosed brackets starting at lines: {stack}")

if __name__ == "__main__":
    check_brackets('src/App.tsx')
