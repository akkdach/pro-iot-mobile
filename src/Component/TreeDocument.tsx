import React, { useState } from 'react';
import {List, ListItemButton, ListItemIcon, ListItemText, Collapse, Box, } from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Checkbox } from "@mui/material";
import { Description as FileIcon, InsertDriveFile, Image as ImageIcon, PictureAsPdf as PdfIcon, TableChart as ExcelIcon, Folder as FolderIcon, } from "@mui/icons-material";

interface TreeNode {
  id?: string;
  name: string;
  children?: TreeNode[];
  fullPath:string
  isFolder:boolean
}

interface TreeDocumentProps {
  data: TreeNode[];
  selectedPaths: string[];
  onToggleSelect: (fullPath: string) => void;
}

const getFileIcon = (filename: string) => {
  const ext = filename.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      return <ImageIcon sx={{ color: '#239be0ff' }} fontSize="small" />;
    case "pdf":
      return <PdfIcon sx={{ color: '#239be0ff' }} fontSize="small" />;
    case "xlsx":
    case "xls":
      return <ExcelIcon sx={{ color: '#239be0ff' }} fontSize="small" />;
    case "doc":
    case "docx":
    case "txt":
      return <FileIcon sx={{ color: '#239be0ff' }} fontSize="small" />;
    default:
      return <InsertDriveFile sx={{ color: '#239be0ff' }} fontSize="small" />;
  }
};

const TreeDocument: React.FC<TreeDocumentProps> = ({ data, selectedPaths, onToggleSelect }) => {
  return (
    <List>
      {data.map((node) => (
        <TreeNodeItem
          key={node.fullPath}
          node={node}
          selectedPaths={selectedPaths}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </List>
  );
};

const TreeNodeItem: React.FC<{
  node: TreeNode;
  selectedPaths: string[];
  onToggleSelect: (fullPath: string) => void;
}> = ({ node, selectedPaths, onToggleSelect }) => {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (node.isFolder) {
      setOpen((prev) => !prev);
    } else {
      // สำหรับไฟล์ จะทำอย่างอื่น เช่น เปิดไฟล์ หรือแสดง preview ก็ได้
      alert(`Clicked file: ${node.fullPath}`);
    }
  };

  return (
    <>
      
      <ListItemButton onClick={handleClick} sx={{ pl: node.isFolder ? 2 : 4 }}>
      {/* ✅ Checkbox ทั้งโฟลเดอร์/ไฟล์ */}
      <ListItemIcon sx={{ minWidth: 48 }}>
        <Checkbox
          edge="start"
          size="small"
          checked={selectedPaths.includes(node.fullPath)}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(node.fullPath);
          }}
        />
      </ListItemIcon>

      {/* ✅ แสดงไอคอนตามชนิด */}
      <ListItemIcon sx={{ minWidth: 40, ml: -3 }}>
        {node.isFolder ? (
          <FolderIcon sx={{ color: '#163299ff' }} />
        ) : (
          getFileIcon(node.name)
        )}
      </ListItemIcon>

      {/* ✅ ชื่อไฟล์ */}
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

      {/* ลูกศรพับ/ขยาย */}
      {node.isFolder ? (open ? <ExpandLess /> : <ExpandMore />) : null}
    </ListItemButton>

      

      {node.isFolder && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {node.children?.map((child) => (
              <TreeNodeItem
                key={child.fullPath}
                node={child}
                selectedPaths={selectedPaths}
                onToggleSelect={onToggleSelect}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

export default TreeDocument;
