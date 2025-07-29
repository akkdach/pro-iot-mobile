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
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';

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
      return <ImageIcon sx={{ color: '#239be0ff' }} fontSize="small" />;
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
}> = ({
  node,
  selectedPaths,
  onToggleSelect,
  flatNodes,
  lastSelectedIndex,
  setLastSelectedIndex,
}) => {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (node.isFolder) {
      setOpen((prev) => !prev);
    } else {
      alert(`Clicked file: ${node.fullPath}`);
    }
  };

  const getAllChildPaths = (node: TreeNode): string[] => {
    if (!node.children || node.children.length === 0) {
      return node.isFolder ? [] : [node.fullPath];
    }

    const childPaths = node.children.flatMap(getAllChildPaths);
    return node.isFolder ? childPaths : [node.fullPath, ...childPaths];
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
      onToggleSelect(node.fullPath);
      setLastSelectedIndex(currentIndex);
    }
  };

  

  return (
    <>
      <ListItemButton onClick={handleClick} sx={{ pl: node.isFolder ? 2 : 4 }}>
        <ListItemIcon sx={{ minWidth: 48 }}>
          <Checkbox
            edge="start"
            size="small"
            checked={selectedPaths.includes(node.fullPath)}
            onClick={handleCheckboxClick}
          />
        </ListItemIcon>

        <ListItemIcon sx={{ minWidth: 40, ml: -3 }}>
          {node.isFolder ? (
            <FolderIcon sx={{ color: '#163299ff' }} />
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
          <List component="div" disablePadding>
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
