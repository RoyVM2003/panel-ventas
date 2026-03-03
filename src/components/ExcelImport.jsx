import { useState, useRef } from 'react'
import { Panel } from './Panel'
import { FormGroup } from './FormGroup'
import { Message } from './Message'
import { importExcel } from '../services/excelService'

export function ExcelImport({ onImportSuccess }) {
  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState('Ningún archivo seleccionado')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: 'info' })
  const inputRef = useRef(null)

  const handleChange = (e) => {
    const f = e.target.files?.[0]
    setFile(f)
    setFileName(f ? f.name : 'Ningún archivo seleccionado')
    setMessage({ text: '', type: 'info' })
  }

  const handleImport = async () => {
    if (!file) {
      setMessage({ text: 'Selecciona un archivo Excel (.xlsx).', type: 'err' })
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
          ? `Listo. Se han añadido ${inserted} contactos nuevos a tu lista. ${duplicates} correos ya estaban guardados y no se repitieron. Ya puedes enviar tu campaña en el Paso 3.`
          : `Listo. Se han añadido ${inserted} contactos a tu lista. Ya puedes enviar tu campaña en el Paso 3.`
      } else if (inserted === 0 && duplicates > 0 && errors === 0) {
        text = `Tu archivo se leyó correctamente. Los ${duplicates} correos que trae ya estaban en tu lista, así que no se añadieron de nuevo. Puedes usarlos igual para enviar tu campaña en el Paso 3.`
      } else if (errors > 0) {
        text = inserted > 0
          ? `Se añadieron ${inserted} contactos. ${errors} correos no se pudieron importar (revisa que sean válidos).`
          : `No se pudieron importar ${errors} correos. Revisa que la columna se llame "email" y que los correos sean válidos.`
      } else {
        text = 'El archivo no contenía contactos nuevos. Revisa que tenga una columna "email" con correos válidos.'
      }

      setMessage({
        text,
        type: errors > 0 && inserted === 0 ? 'err' : 'ok',
      })
      onImportSuccess?.()
    } catch (err) {
      const msg =
        err.data?.message ||
        err.data?.error ||
        (err.data && typeof err.data === 'object' ? JSON.stringify(err.data) : err.message)
      setMessage({ text: 'Error al importar: ' + msg, type: 'err' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Panel title="Paso 1 · Contactos (Excel)" icon="fas fa-file-excel">
      <p className="form-group hint">
        Sube un archivo .xlsx con los <strong>contactos</strong> a los que quieres escribir. Aquí cargas tu lista de personas; en el Paso 2 solo defines el asunto y el texto del correo.
      </p>
      <details className="form-group hint" style={{ marginBottom: '0.75rem', fontSize: '0.95rem' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 600 }}>¿Qué formato debe tener el Excel?</summary>
        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
          <li>Primera fila con los nombres de las columnas (encabezados).</li>
          <li>Al menos una columna llamada <strong>email</strong> (obligatoria) y, si quieres, otra columna con el <strong>nombre</strong>.</li>
          <li>Correos válidos y sin repetir (ni dentro del archivo ni ya cargados antes).</li>
        </ul>
      </details>
      <FormGroup label="Seleccionar archivo Excel" id="fileExcel">
        <input
          ref={inputRef}
          type="file"
          id="fileExcel"
          accept=".xlsx,.xls"
          onChange={handleChange}
        />
        <div className="file-name">{fileName}</div>
      </FormGroup>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={handleImport}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="btn-spinner" aria-hidden="true" /> Importando...
          </>
        ) : (
          <>
            <i className="fas fa-upload"></i> Importar Excel
            <span
              className="help-icon"
              title="Debe tener al menos una columna email con correos válidos y, si quieres, otra con el nombre."
            >
              ?
            </span>
          </>
        )}
      </button>
      <Message text={message.text} type={message.type} className="mt-1" />
    </Panel>
  )
}
