import { useState, useRef } from 'react';
import { Button, Alert } from '@mantine/core';
import { IconFileImport, IconDeviceFloppy, IconX, IconCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { importAcademicResultsFromExcel } from '../services';
import classes from './ImportAcademicResultCard.module.css';

interface Props {
  onCancel: () => void;
  onSave: () => void;
  khoa: string;
}

export function ImportAcademicResultCard({ onCancel, onSave }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      notifications.show({
        title: 'Lỗi',
        message: 'Vui lòng chọn file Excel (.xlsx hoặc .xls)',
        color: 'red',
      });
      return;
    }
    setSelectedFile(file);
    setApiError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setApiError('Vui lòng chọn file Excel để import');
      return;
    }

    setLoading(true);
    setApiError(null);

    try {
      await importAcademicResultsFromExcel(selectedFile);
      notifications.show({
        title: 'Thành công',
        message: 'Import kết quả học tập từ Excel thành công',
        color: 'green',
      });
      onSave();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi import kết quả học tập');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.page}>
      <div className={classes.section}>
        <div className={classes.sectionTitle}>
          <div className={classes.sectionIcon}>
            <IconFileImport size={18} />
          </div>
          <span className={classes.sectionNum}>1.</span>
          <span className={classes.sectionText}>Chọn file Excel</span>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />

        <div
          className={`${classes.uploadZone} ${isDragOver ? classes.dragOver : ''}`}
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {selectedFile ? (
            <>
              <IconCheck size={48} className={classes.uploadIcon} style={{ color: '#10B981' }} />
              <p className={classes.uploadTitle}>File đã chọn</p>
              <p className={classes.fileName}>{selectedFile.name}</p>
              <p className={classes.uploadDesc}>Click để chọn file khác</p>
            </>
          ) : (
            <>
              <IconFileImport size={48} className={classes.uploadIcon} />
              <p className={classes.uploadTitle}>Kéo thả file Excel vào đây</p>
              <p className={classes.uploadDesc}>hoặc click để chọn file (.xlsx, .xls)</p>
            </>
          )}
        </div>
      </div>

      <div className={classes.footer}>
        <Button
          variant="subtle"
          color="gray"
          leftSection={<IconX size={16} />}
          onClick={onCancel}
          className={classes.cancelBtn}
          disabled={loading}
        >
          Huỷ
        </Button>
        <Button
          leftSection={<IconDeviceFloppy size={16} />}
          onClick={handleImport}
          className={classes.saveBtn}
          loading={loading}
          disabled={!selectedFile}
        >
          Import kết quả
        </Button>
      </div>

      {apiError && (
        <Alert color="red" title="Lỗi">
          {apiError}
        </Alert>
      )}
    </div>
  );
}
