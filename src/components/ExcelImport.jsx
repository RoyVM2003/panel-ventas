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
      // Doc: respuesta { success, message, insertedCount, duplicateCount, internalDuplicateCount, errorCount, ... }
      const parts = [data.message || 'Importación correcta.']
      if (data.insertedCount != null) parts.push(`${data.insertedCount} registros insertados`)
      if (data.duplicateCount != null && data.duplicateCount > 0) {
        parts.push(`${data.duplicateCount} emails ya existían en la BD (omitidos)`)
      }
      if (data.internalDuplicateCount != null && data.internalDuplicateCount > 0) {
        parts.push(`${data.internalDuplicateCount} duplicados dentro del archivo (omitidos)`)
      }
      if (data.errorCount != null && data.errorCount > 0) parts.push(`${data.errorCount} con error`)
      const inserted = data.insertedCount ?? 0
      const duplicates = (data.duplicateCount ?? 0) + (data.internalDuplicateCount ?? 0)
      if (inserted === 0 && duplicates > 0) {
        parts.push('Esos contactos ya están en la base: puedes usarlos para enviar campañas en el Paso 3.')
      }
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
        Sube un archivo .xlsx con los <strong>contactos</strong> a los que quieres escribir. Los contactos son tu base de envíos; las campañas son el asunto y el mensaje que defines en el Paso 2.
      </p>
      <details className="form-group hint" style={{ marginBottom: '0.75rem', fontSize: '0.9rem' }}>
        <summary style={{ cursor: 'pointer' }}>¿Qué formato debe tener el Excel?</summary>
        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
          <li>Primera fila: nombres de columnas (encabezados).</li>
          <li>Al menos una columna <strong>email</strong> (obligatoria) y, según tu backend, columnas opcionales como <strong>nombre</strong>.</li>
          <li>Emails válidos y únicos (sin duplicados dentro del archivo ni ya existentes en la base de datos).</li>
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
