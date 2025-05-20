type FileType = 
  | 'word' | 'excel' | 'powerpoint' 
  | 'pdf' | 'video' | 'image' 
  | 'zip' | 'code' | 'url' | 'audio'
  | 'executable' | 'script' | 'unknown';

export const getFileType = (filename: string): FileType => {
  const ext = filename.toLowerCase().split('.').pop() || '';
  
  if (['doc', 'docx'].includes(ext)) return 'word';
  if (['xls', 'xlsx'].includes(ext)) return 'excel';
  if (['ppt', 'pptx'].includes(ext)) return 'powerpoint';
  if (ext === 'pdf') return 'pdf';
  if (['mp4', 'avi', 'mov', 'webm'].includes(ext)) return 'video';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
  if (['zip', 'rar', '7z'].includes(ext)) return 'zip';
  if (['py', 'java', 'cpp', 'c', 'js', 'ts', 'html', 'css'].includes(ext)) return 'code';
  if (['url', 'link'].includes(ext)) return 'url';
  if (['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(ext)) return 'audio';
  if (['exe', 'msi', 'app'].includes(ext)) return 'executable';
  if (['sh', 'bash', 'bat', 'cmd', 'ps1'].includes(ext)) return 'script';
  return 'unknown';
}

export const getFileIcon = (type: FileType): string => {
  const icons = {
    word: 'fa-file-word text-primary',
    excel: 'fa-file-excel text-success',
    powerpoint: 'fa-file-powerpoint text-danger',
    pdf: 'fa-file-pdf text-danger',
    video: 'fa-file-video text-info',
    image: 'fa-file-image text-warning',
    zip: 'fa-file-archive text-secondary',
    code: 'fa-file-code text-primary',
    url: 'fa-link text-info',
    audio: 'fa-file-audio text-info',
    executable: 'fa-cog text-secondary',
    script: 'fa-terminal text-success',
    unknown: 'fa-file text-muted'
  };
  
  return `fas ${icons[type]}`;
}
