import json
from pathlib import Path


def generar_manifest_pptx(directorio='./Corario', nombre_json='./Corario/corario.json'):
    """Recorre la carpeta Corario y genera corario.json con PDF."""
    carpeta = Path(directorio)

    if not carpeta.exists() or not carpeta.is_dir():
        raise FileNotFoundError(f"Directorio no válido: {carpeta}")

    archivos_pdf = []
    for entrada in carpeta.iterdir():
        if entrada.is_file() and entrada.suffix.lower() == '.pdf':
            archivos_pdf.append(entrada.name)

    archivos_pdf = sorted(archivos_pdf)

    salida = carpeta / nombre_json
    with salida.open('w', encoding='utf-8') as f:
        json.dump(archivos_pdf, f, ensure_ascii=False, indent=2)

    return archivos_pdf


if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='Generar corario.json desde un directorio PDF')
    parser.add_argument('-d', '--directorio', default='./Corario',
                        help='Directorio donde buscar PDF (por defecto: Corario)')
    args = parser.parse_args()

    posibles = [
        Path(args.directorio),
        Path(__file__).parent / args.directorio,
        Path('./Partituras') / args.directorio,
        Path('.') / args.directorio,
        Path('./Partituras/Corario'),
    ]

    encontrado = None
    for ruta in posibles:
        if ruta.exists() and ruta.is_dir():
            encontrado = ruta
            break

    if not encontrado:
        print('Error: no se encontró un directorio válido. Probadas:', ', '.join(str(r) for r in posibles))
    else:
        try:
            lista = generar_manifest_pptx(encontrado, './Corario/corario.json')
            print(f'Generado {encontrado / "./Corario/corario.json"} con {len(lista)} pptx')
            for cancion in lista:
                print('-', cancion)
        except Exception as e:
            print('Error:', e)
