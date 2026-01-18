import os

root_dir = 'client/app'
old_port = 'http://localhost:3201' # Bu az önceki halimizdi
new_port = 'http://localhost:3201/api' # Yeni halimiz bu olmalı

for root, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith('.tsx'):
            file_path = os.path.join(root, file)
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if old_port in content and 'http://localhost:3201/api' not in content:
                print(f"Updating {file_path}")
                new_content = content.replace(old_port, new_port)
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
