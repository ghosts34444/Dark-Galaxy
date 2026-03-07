import re
import os
from pathlib import Path

def extract_selectors(css_content):
    """Извлекает все селекторы из CSS кода"""
    selectors = []
    lines = css_content.split('\n')
    
    for line in lines:
        stripped = line.strip()
        # Пропускаем пустые строки, комментарии и @-правила
        if not stripped or stripped.startswith('/*') or stripped.startswith('@'):
            continue
        # Ищем строку с открывающей скобкой {
        if '{' in stripped and not stripped.startswith(('@', '/*')):
            # Берём часть до первой {
            sel = stripped.split('{')[0].strip()
            if sel and sel != '':
                selectors.append(sel)
    
    return selectors

def find_css_files(root_dir='.'):
    """Находит все CSS файлы в проекте, исключая системные папки"""
    css_files = []
    root = Path(root_dir).resolve()
    
    for path in root.rglob('*.css'):
        parts = path.parts
        # Исключаем системные папки
        if 'node_modules' in parts or '.git' in parts or '__pycache__' in parts:
            continue
        css_files.append(path.resolve())
    
    return sorted(css_files)

def process_css_files(output_file='selectors_list.txt'):
    """Обрабатывает все найденные CSS файлы"""
    
    # Ищем CSS файлы из текущей директории
    css_files = find_css_files()
    
    if not css_files:
        print("❌ CSS файлы не найдены. Проверь, что скрипт запущен из корня проекта.")
        print(f"   Текущая директория: {Path.cwd()}")
        return
    
    print(f"📁 Найдено CSS файлов: {len(css_files)}\n")
    for i, f in enumerate(css_files, 1):
        print(f"   {i}. {f.name} ({f.parent.name})")
    
    all_selectors = {}
    unique_selectors = set()
    
    for file_path in css_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            selectors = extract_selectors(content)
            # Сохраняем относительный путь от корня проекта
            rel_path = file_path.relative_to(Path.cwd())
            all_selectors[str(rel_path)] = selectors
            unique_selectors.update(selectors)
            
            print(f"   ✓ {file_path.name}: {len(selectors)} селекторов")
            
        except Exception as e:
            print(f"⚠️  Ошибка при чтении {file_path.name}: {e}")
    
    # Сохраняем результат
    with open(output_file, 'w', encoding='utf-8') as out:
        out.write("=" * 70 + "\n")
        out.write("СПИСОК ВСЕХ СЕЛЕКТОРОВ ИЗ CSS ФАЙЛОВ ПРОЕКТА\n")
        out.write("=" * 70 + "\n")
        out.write(f"\nДата анализа: {os.path.basename(__file__)}\n")
        out.write(f"Найдено файлов: {len(css_files)}\n")
        out.write(f"Уникальных селекторов: {len(unique_selectors)}\n")
        out.write("=" * 70 + "\n\n")
        
        # По файлам
        for file_path, selectors in all_selectors.items():
            out.write(f"\n{'='*70}\n")
            out.write(f"📁 {file_path}\n")
            out.write(f"   Селекторов: {len(selectors)}\n")
            out.write('='*70 + "\n\n")
            if selectors:
                for sel in selectors:
                    out.write(f"{sel}\n")
            else:
                out.write("(нет селекторов)\n")
        
        # Сводка уникальных
        out.write(f"\n\n{'='*70}\n")
        out.write(f"📊 УНИКАЛЬНЫЕ СЕЛЕКТОРЫ (всего: {len(unique_selectors)})\n")
        out.write('='*70 + "\n\n")
        if unique_selectors:
            for sel in sorted(unique_selectors):
                out.write(f"{sel}\n")
        else:
            out.write("(нет уникальных селекторов)\n")
    
    print(f"\n✅ Результат сохранён в: {output_file}")
    print(f"📊 Уникальных селекторов: {len(unique_selectors)}")
    
    # Краткий вывод в консоль
    if unique_selectors:
        print("\n📋 Примеры селекторов:")
        print("-" * 40)
        for i, sel in enumerate(sorted(unique_selectors)[:15], 1):
            print(f"{i:2}. {sel}")
    
    return unique_selectors

if __name__ == "__main__":
    print("🔍 Поиск CSS файлов в проекте...\n")
    process_css_files()