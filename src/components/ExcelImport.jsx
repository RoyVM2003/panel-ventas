import { useState, useRef } from 'react'
import { Panel } from './Panel'
import { Message } from './Message'
import { importExcel } from '../services/excelService'

export function ExcelImport({ onImportSuccess }) {
  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: 'info' })
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const applyFile = (f) => {
    if (!f) return
    setFile(f)
    setFileName(f.name)
    setMessage({ text: '', type: 'info' })
  }

  const handleChange = (e) => applyFile(e.target.files?.[0])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    applyFile(e.dataTransfer.files?.[0])
  }

  const handleImport = async () => {
    if (!file) {
      setMessage({ text: 'Elige un archivo Excel (.xlsx) para importar.', type: 'err' })
      return
    }
    setLoading(true)
    setMessage({ text: 'Importando...', type: 'info' })
    try {
      const data = await importExcel(file)
      const inserted = data.insertedCount ?? 0
      const duplicates = (data.duplicateCount ?? 0) + (data.internalDuplicateCount ?? 0)
      const errors = data.errorCount ?? 0

      let text
      if (inserted > 0 && errors === 0) {
        text = duplicates > 0
          ? `Listo. Se añadieron ${inserted} contactos nuevos. ${duplicates} correos ya estaban guardados y no se repitieron.`
          : `Listo. Se añadieron ${inserted} contactos a tu lista. Ya puedes lanzar tu campaña.`
      } else if (inserted === 0 && duplicates > 0 && errors === 0) {
        text = `Los ${duplicates} correos del archivo ya estaban en tu lista. Puedes usarlos para enviar tu campaña.`
      } else if (errors > 0) {
        text = inserted > 0
          ? `Se añadieron ${inserted} contactos. ${errors} correos no pudieron importarse (revisa que sean válidos).`
          : `No se pudieron importar ${errors} correos. Revisa que la columna se llame "email" y contenga correos válidos.`
      } else {
        text = 'El archivo no contenía contactos nuevos. Revisa que tenga una columna "email" con correos válidos.'
      }

      setMessage({ text, type: errors > 0 && inserted === 0 ? 'err' : 'ok' })
      onImportSuccess?.()
    } catch (err) {
      const msg =
        err.data?.message ||
        err.data?.error ||
        (err.data && typeof err.data === 'object' ? JSON.stringify(err.data) : err.message)
      setMessage({ text: 'No se pudo importar el archivo. ' + msg, type: 'err' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Panel title="Paso 1 — Importar contactos" icon="fas fa-users">

      <p className="form-hint-text">
        Sube un archivo <strong>.xlsx</strong> con la columna <strong>email</strong> (y opcionalmente <strong>nombre</strong>). Esos serán los destinatarios de tu campaña.
      </p>

      {/* Zona de carga drag & drop */}
      <div
        className={`upload-zone${dragging ? ' upload-zone--drag' : ''}${file ? ' upload-zone--ready' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        aria-label="Zona para subir archivo Excel"
      >
        <div className={`upload-zone-icon${file ? ' upload-zone-icon--ready' : ''}`}>
          <i className={file ? 'fas fa-file-circle-check' : 'fas fa-cloud-arrow-up'}></i>
        </div>
        <div className="upload-zone-info">
          <strong>{file ? fileName : 'Arrastra tu Excel aquí'}</strong>
          <span>{file ? 'Archivo listo · haz clic para cambiarlo' : 'o haz clic para seleccionar · formato .xlsx'}</span>
        </div>
        {file && (
          <div className="upload-zone-badge">
            <i className="fas fa-check"></i>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        id="fileExcel"
        accept=".xlsx,.xls"
        onChange={handleChange}
        style={{ display: 'none' }}
      />

      <details className="upload-format-hint">
        <summary>¿Qué formato debe tener el Excel?</summary>
        <ul>
          <li>Primera fila con encabezados de columna.</li>
          <li>Columna obligatoria: <strong>email</strong>. Opcional: <strong>nombre</strong>.</li>
          <li>Correos válidos y sin duplicados.</li>
        </ul>
      </details>

      <button
        type="button"
        className="btn btn-secondary"
        onClick={handleImport}
        disabled={loading || !file}
      >
        {loading ? (
          <><span className="btn-spinner" aria-hidden="true" /> Importando...</>
        ) : (
          <><i className="fas fa-upload"></i> Importar contactos</>
        )}
      </button>

      <Message text={message.text} type={message.type} className="mt-1" />
    </Panel>
  )
}
