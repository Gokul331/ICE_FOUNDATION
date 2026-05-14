from pathlib import Path
files = {
    'src/styles/navbar.css': """...""",
}
for rel_path, content in files.items():
    Path(rel_path).write_text(content, encoding='utf-8')
