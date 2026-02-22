import os
from pathlib import Path
import re

def merge_css_files(output_file='styles_merged.css'):
    """Объединяет все CSS файлы проекта в один"""
    
    # Находим все CSS файлы
    css_files = []
    for path in Path('.').rglob('*.css'):
        parts = path.parts
        if 'node_modules' in parts or '.git' in parts or '__pycache__' in parts:
            continue
        css_files.append(path.resolve())
    
    if not css_files:
        print("❌ CSS файлы не найдены")
        return
    
    print(f"📁 Найдено файлов: {len(css_files)}\n")
    
    # Читаем все файлы
    all_content = []
    for file_path in css_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                # Добавляем комментарий с именем файла для отладки
                all_content.append(f"\n/* ===== {file_path.name} ===== */\n{content}")
                print(f"✓ {file_path.name}")
        except Exception as e:
            print(f"⚠️  {file_path.name}: {e}")
    
    # Объединяем
    merged = "\n".join(all_content)
    
    # Сохраняем
    with open(output_file, 'w', encoding='utf-8') as out:
        out.write("/* ========================================\n")
        out.write("   ОБЪЕДИНЁННЫЕ СТИЛИ ПРОЕКТА\n")
        out.write("   Автоматически сгенерировано\n")
        out.write("   ======================================== */\n\n")
        out.write(merged)
    
    # Считаем размер
    size_kb = os.path.getsize(output_file) / 1024
    
    print(f"\n✅ Объединено в: {output_file}")
    print(f"📊 Размер: {size_kb:.1f} KB")
    print(f"🎯 Файлов объединено: {len(css_files)}")

if __name__ == "__main__":
    print("🔧 Объединение CSS файлов...\n")
    merge_css_files('saut/styles/merged.css')