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
      setMessage({
        text: 'Importación correcta. ' + (data.message || JSON.stringify(data)),
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
        Sube un archivo .xlsx para importar contactos. La API espera columnas según la documentación (ej. email, nombre).
      </p>
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
