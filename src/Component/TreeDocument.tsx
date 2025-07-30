import React, { useState } from 'react';
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Box,
} from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Checkbox } from '@mui/material';
import {
  Description as FileIcon,
  InsertDriveFile,
  Image as ImageRoundedIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Folder as FolderRoundedIcon,
  Padding,
} from '@mui/icons-material';
import DownloadIcon from '@mui/icons-material/Download';
import Swal from 'sweetalert2';
import callDocu from '../Services/callDocu';
import saveAs from 'file-saver';

interface TreeNode {
  id?: string;
  name: string;
  children?: TreeNode[];
  fullPath: string;
  isFolder: boolean;
}

interface TreeDocumentProps {
  data: TreeNode[];
  selectedPaths: string[];
  onToggleSelect: (fullPath: string) => void;
  lastSelectedIndex: number | null;
  setLastSelectedIndex: (index: number) => void;
}

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return <ImageRoundedIcon sx={{ color: '#239be0ff' }} fontSize="small" />;
    case 'pdf':
      return <PdfIcon sx={{ color: '#239be0ff' }} fontSize="small" />;
    case 'xlsx':
    case 'xls':
      return <ExcelIcon sx={{ color: '#239be0ff' }} fontSize="small" />;
    case 'doc':
    case 'docx':
    case 'txt':
      return <FileIcon sx={{ color: '#239be0ff' }} fontSize="small" />;
    default:
      return <InsertDriveFile sx={{ color: '#239be0ff' }} fontSize="small" />;
  }
};

const TreeDocument: React.FC<TreeDocumentProps> = ({
  data,
  selectedPaths,
  onToggleSelect,
  lastSelectedIndex,
  setLastSelectedIndex,
}) => {
  const flatNodes: TreeNode[] = [];
  const flatten = (nodes: TreeNode[]) => {
    for (const node of nodes) {
      flatNodes.push(node);
      if (node.children) flatten(node.children);
    }
  };
  flatten(data);

  return (
    <List>
      {data.map((node) => (
        <TreeNodeItem
          key={node.fullPath}
          node={node}
          selectedPaths={selectedPaths}
          onToggleSelect={onToggleSelect}
          flatNodes={flatNodes}
          lastSelectedIndex={lastSelectedIndex}
          setLastSelectedIndex={setLastSelectedIndex}
        />
      ))}
    </List>
  );
};

const TreeNodeItem: React.FC<{
  node: TreeNode;
  selectedPaths: string[];
  onToggleSelect: (fullPath: string) => void;
  flatNodes: TreeNode[];
  lastSelectedIndex: number | null;
  setLastSelectedIndex: (index: number) => void;
  onDownloadFolder?: (path: string) => void;
}> = ({
  node,
  selectedPaths,
  onToggleSelect,
  flatNodes,
  lastSelectedIndex,
  setLastSelectedIndex,
  onDownloadFolder,
}) => {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (node.isFolder) {
      setOpen((prev) => !prev);
    } else {
      alert(`Clicked file: ${node.fullPath}`);
    }
  };

  // const handleDownloadClick = (e: React.MouseEvent) => {
  //   e.stopPropagation(); // กันไม่ให้ collapse พับ
  //   if (onDownloadFolder) {
  //     onDownloadFolder(node.fullPath);
  //   }
  // };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const fileName = node.fullPath.split("\\").pop(); // ดึงชื่อโฟลเดอร์
      const res = await callDocu.get(`/FileManager/DownloadZip?folderPath=${node.fullPath}`, {
        responseType: 'blob', // ใส่เพื่อดาวน์โหลดไฟล์zipได้
      });

      saveAs(res.data, `${fileName || 'folder'}.zip`);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: `Download failed for: "${node.fullPath}"`,
        confirmButtonColor: '#d33',
      });
    }
  };


  const getAllChildPaths = (node: TreeNode): string[] => {
    const paths: string[] = [];

    const collectPaths = (n: TreeNode) => {
      if (n.children && n.children.length > 0) {
        n.children.forEach(collectPaths); //ลูปซ้อนลึกไปเรื่อย ๆ
      } else if (!n.isFolder) {
        paths.push(n.fullPath); //เก็บเฉพาะ path ของไฟล์
      }
    };

    collectPaths(node); //เริ่มโหนดนี้
    return paths;
  };



  const handleCheckboxClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const currentIndex = flatNodes.findIndex((n) => n.fullPath === node.fullPath);

    if (e.shiftKey && lastSelectedIndex !== null) {
      const [start, end] = [lastSelectedIndex, currentIndex].sort((a, b) => a - b);
      const toToggle = flatNodes
        .slice(start, end + 1)
        .filter((n) => !n.isFolder)
        .map((n) => n.fullPath);

      toToggle.forEach((path) => {
        onToggleSelect(path);
      });
    } else {
      const isSelected = selectedPaths.includes(node.fullPath);

      const pathsToToggle = node.isFolder
        ? getAllChildPaths(node) // ไม่รวมโฟลเดอร์เอง
        : [node.fullPath];

      pathsToToggle.forEach((path) => {
        onToggleSelect(path);
      });

      setLastSelectedIndex(currentIndex);
    }
  };


  const childPaths = getAllChildPaths(node);
  const isChecked = node.isFolder
    ? childPaths.length > 0 && childPaths.every((path) => selectedPaths.includes(path))
    : selectedPaths.includes(node.fullPath);



  return (
    <>
      <ListItemButton onClick={handleClick} sx={{ pl: node.isFolder ? 2 : 4 }}>
        {node.isFolder && (
          <ListItemIcon sx={{ minWidth: 40 }}>
            <DownloadIcon
              onClick={handleDownload}
              sx={{ color: '#2086c1ff', cursor: 'pointer', mr: 1, fontSize:'12' }}
            />
          </ListItemIcon>
        )}

        <ListItemIcon sx={{ minWidth: 40, ml: node.isFolder ? 0 : -3 }}>
          {node.isFolder ? (
            <FolderRoundedIcon sx={{ color: '#163299ff' }} />
          ) : (
            getFileIcon(node.name)
          )}
        </ListItemIcon>

        <ListItemText
          primary={node.name}
          primaryTypographyProps={{
            fontSize: 13,
            sx: {
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              ml: -1.5,
            },
          }}
        />

        {node.isFolder ? (open ? <ExpandLess /> : <ExpandMore />) : null}
      </ListItemButton>

        {node.isFolder && (
          <Collapse in={open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{pl:1}}>
              {node.children?.map((child) => (
                <TreeNodeItem
                  key={child.fullPath}
                  node={child}
                  selectedPaths={selectedPaths}
                  onToggleSelect={onToggleSelect}
                  flatNodes={flatNodes}
                  lastSelectedIndex={lastSelectedIndex}
                  setLastSelectedIndex={setLastSelectedIndex}
                />
              ))}
            </List>
          </Collapse>
        )}
      </>
  );
};

export default TreeDocument;
