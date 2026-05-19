import { useMemo, useRef, useState } from 'react';
import { Button, Group, Stack, Text, Textarea } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconDatabase, IconFileText, IconTrash, IconUpload } from '@tabler/icons-react';
import { deleteDocuments, uploadDocuments } from './services';
import classes from './DocumentsPage.module.css';

function parseSources(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map(source => source.trim())
    .filter(Boolean);
}

function getFileKey(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export function DocumentsPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [sourceText, setSourceText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const sources = useMemo(() => parseSources(sourceText), [sourceText]);

  const handleUpload = async () => {
    if (files.length === 0) {
      notifications.show({
        title: 'Lỗi',
        message: 'Vui lòng chọn file cần upload',
        color: 'red',
      });
      return;
    }

    setUploading(true);
    try {
      const result = await uploadDocuments(files);
      notifications.show({
        title: 'Thành công',
        message: `Đã xử lý ${result.processedFiles} file tài liệu`,
        color: 'green',
      });
      setFiles([]);
    } catch (err) {
      notifications.show({
        title: 'Lỗi',
        message: err instanceof Error ? err.message : 'Không thể upload tài liệu',
        color: 'red',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (sources.length === 0) {
      notifications.show({
        title: 'Lỗi',
        message: 'Vui lòng nhập ít nhất một source cần xóa',
        color: 'red',
      });
      return;
    }

    setDeleting(true);
    try {
      await deleteDocuments(sources);
      notifications.show({
        title: 'Thành công',
        message: 'Đã xóa tài liệu khỏi kho tra cứu',
        color: 'green',
      });
      setSourceText('');
    } catch (err) {
      notifications.show({
        title: 'Lỗi',
        message: err instanceof Error ? err.message : 'Không thể xóa tài liệu',
        color: 'red',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={classes.page}>
      <div className={classes.pageHeader}>
        <h1 className={classes.pageTitle}>Tài liệu AI Agent</h1>
        <p className={classes.pageDesc}>
          Quản lý tài liệu phục vụ kho tra cứu RAG của chatbot
        </p>
      </div>

      <Stack gap={20}>
        <div className={classes.panel}>
          <div className={classes.panelHeader}>
            <div className={classes.panelIcon}>
              <IconUpload size={20} />
            </div>
            <div>
              <h2 className={classes.panelTitle}>Upload tài liệu</h2>
              <p className={classes.panelDesc}>Tài liệu sau khi upload sẽ được xử lý thành chunk để AI Agent tra cứu.</p>
            </div>
          </div>

          <Stack gap={14}>
            <div>
              <Text size="sm" fw={500} mb={6}>File tài liệu</Text>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className={classes.hiddenInput}
                onChange={(event) => {
                  const selectedFiles = Array.from(event.currentTarget.files || []);
                  setFiles(prev => {
                    const existingKeys = new Set(prev.map(getFileKey));
                    const newFiles = selectedFiles.filter(file => !existingKeys.has(getFileKey(file)));
                    return [...prev, ...newFiles];
                  });
                  event.currentTarget.value = '';
                }}
              />
              <Group gap={8}>
                <Button
                  variant="light"
                  color="gray"
                  leftSection={<IconFileText size={16} />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Chọn file
                </Button>
                {files.length > 0 && (
                  <Button variant="subtle" color="gray" onClick={() => setFiles([])}>
                    Bỏ chọn
                  </Button>
                )}
              </Group>
              <div className={classes.fileList}>
                {files.length === 0 ? (
                  <Text size="sm" c="dimmed">Chưa chọn file nào</Text>
                ) : (
                  files.map((selectedFile) => (
                    <div key={getFileKey(selectedFile)} className={classes.fileItem}>
                      <IconFileText size={16} />
                      <span>{selectedFile.name}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
            <Group justify="flex-end">
              <Button
                leftSection={<IconUpload size={16} />}
                onClick={handleUpload}
                loading={uploading}
                disabled={files.length === 0}
              >
                Upload
              </Button>
            </Group>
          </Stack>

        </div>

        <div className={classes.panel}>
          <div className={classes.panelHeader}>
            <div className={classes.panelIcon}>
              <IconDatabase size={20} />
            </div>
            <div>
              <h2 className={classes.panelTitle}>Xóa tài liệu</h2>
              <p className={classes.panelDesc}>Nhập source tài liệu cần xóa, mỗi dòng một source hoặc phân tách bằng dấu phẩy.</p>
            </div>
          </div>

          <Stack gap={14}>
            <Textarea
              label="Source cần xóa"
              placeholder="VD: quy-che-dao-tao.pdf"
              minRows={6}
              value={sourceText}
              onChange={(event) => {
                const value = event.currentTarget.value;
                setSourceText(value);
              }}
            />

            {sources.length > 0 && (
              <div className={classes.sourcePreview}>
                <Text size="sm" fw={600} mb={6}>Sẽ xóa {sources.length} source:</Text>
                <Text size="sm">{sources.join(', ')}</Text>
              </div>
            )}

            <Group justify="flex-end">
              <Button
                color="red"
                leftSection={<IconTrash size={16} />}
                onClick={handleDelete}
                loading={deleting}
                disabled={sources.length === 0}
              >
                Xóa tài liệu
              </Button>
            </Group>
          </Stack>
        </div>
      </Stack>
    </div>
  );
}
