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
      // Doc: respuesta { success, message, insertedCount, duplicateCount, internalDuplicateCount, errorCount }
      const parts = [data.message || 'Importación correcta.']
      if (data.insertedCount != null) parts.push(`Insertados: ${data.insertedCount}`)
      if (data.duplicateCount != null && data.duplicateCount > 0) parts.push(`Duplicados: ${data.duplicateCount}`)
      if (data.errorCount != null && data.errorCount > 0) parts.push(`Errores: ${data.errorCount}`)
      setMessage({
        text: parts.join(' · '),
        type: 'ok',
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
    <Panel title="Paso 1 · Base de datos (Excel)" icon="fas fa-file-excel">
      <p className="form-group hint">
        Sube un archivo .xlsx para importar contactos con columnas como email y nombre.
      </p>
      <details className="form-group hint" style={{ marginBottom: '0.75rem', fontSize: '0.9rem' }}>
        <summary style={{ cursor: 'pointer' }}>¿Qué formato debe tener el Excel?</summary>
        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
          <li>Primera fila: nombres de columnas (encabezados).</li>
          <li>El backend suele esperar al menos una columna <strong>email</strong> (obligatoria) y opcionalmente <strong>nombre</strong>. Los nombres exactos los define el backend.</li>
          <li>Emails válidos y únicos (no duplicados en el archivo ni ya existentes en la base).</li>
          <li>Puedes consultar el formato exacto en la documentación del API: <a href="https://osdemsventas.site/api-docs" target="_blank" rel="noopener noreferrer">osdemsventas.site/api-docs</a> (busca el endpoint de import) o pide al administrador la especificación.</li>
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
        <i className="fas fa-upload"></i> Importar Excel
      </button>
      <Message text={message.text} type={message.type} className="mt-1" />
    </Panel>
  )
}
