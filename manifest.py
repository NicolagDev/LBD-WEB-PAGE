import json
from pathlib import Path


def generar_manifest_pdf(directorio: Path, archivo_salida: Path) -> list[str]:
    """Recorre un directorio y genera un JSON con los nombres de los PDF encontrados."""
    if not directorio.exists() or not directorio.is_dir():
        raise FileNotFoundError(f"Directorio no válido: {directorio}")

    archivos_pdf = sorted(
        entrada.name
        for entrada in directorio.iterdir()
        if entrada.is_file() and entrada.suffix.lower() == '.pdf'
    )

    archivo_salida.parent.mkdir(parents=True, exist_ok=True)
    with archivo_salida.open('w', encoding='utf-8') as f:
        json.dump(archivos_pdf, f, ensure_ascii=False, indent=2)

    return archivos_pdf


if __name__ == '__main__':
    import argparse

    # Raíz del proyecto = carpeta donde está este script
    raiz = Path(__file__).parent

    parser = argparse.ArgumentParser(description='Genera corario.json desde un directorio de PDFs')
    parser.add_argument(
        '-d', '--directorio',
        default=str(raiz / 'Corario'),
        help='Directorio donde buscar PDFs (por defecto: <raiz>/Corario)'
    )
    parser.add_argument(
        '-o', '--salida',
        default=str(raiz / 'Corario' / 'corario.json'),
        help='Ruta del JSON de salida (por defecto: <raiz>/Corario/corario.json)'
    )
    args = parser.parse_args()

    directorio = Path(args.directorio)
    salida = Path(args.salida)

    try:
        lista = generar_manifest_pdf(directorio, salida)
        print(f'✓ Generado {salida} con {len(lista)} PDF(s):')
        for nombre in lista:
            print(' -', nombre)
    except FileNotFoundError as e:
        print(f'Error: {e}')