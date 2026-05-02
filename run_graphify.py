#!/usr/bin/env python3
import json
from graphify.extract import collect_files, extract
from pathlib import Path
import os

os.chdir(Path(__file__).parent)

# Create output directory
Path('graphify-out').mkdir(exist_ok=True)

code_files = [
    "list_models.js",
    "main.js", 
    "server.js",
    "vite.config.js",
    "src/api/api.test.js",
    "src/api/firebase.js",
    "src/api/gemini.js"
]

code_paths = [Path(f) for f in code_files if Path(f).exists()]

if code_paths:
    result = extract(code_paths)
    Path('graphify-out/.graphify_ast.json').write_text(json.dumps(result, indent=2))
    print(f'AST: {len(result["nodes"])} nodes, {len(result["edges"])} edges')
else:
    Path('graphify-out/.graphify_ast.json').write_text(json.dumps({'nodes':[],'edges':[],'input_tokens':0,'output_tokens':0}))
    print('No code files found')
