import os
from extract_msg import Message

carpeta_msgs = r"C:\Users\DELL\Downloads\Dra Kow"
carpeta_salida = r"C:\Users\DELL\Downloads\Dra Kow\a    "

os.makedirs(carpeta_salida, exist_ok=True)

for archivo in os.listdir(carpeta_msgs):
    if archivo.lower().endswith(".msg"):
        ruta_msg = os.path.join(carpeta_msgs, archivo)
        nombre_base = os.path.splitext(archivo)[0].strip()
        carpeta_msg = os.path.join(carpeta_salida, nombre_base)
        os.makedirs(carpeta_msg, exist_ok=True)

        try:
            msg = Message(ruta_msg)

            # Guardar adjuntos
            for attach in msg.attachments:
                ruta_adjunto = os.path.join(carpeta_msg, attach.longFilename)
                with open(ruta_adjunto, "wb") as f:
                    f.write(attach.data)

            # Guardar cuerpo
            with open(os.path.join(carpeta_msg, "mensaje.txt"), "w", encoding="utf-8", errors="ignore") as f:
                f.write(msg.body or "")

            print(f"Procesado OK: {archivo}")

        except Exception as e:
            print(f"Error procesando {archivo}: {e}")
