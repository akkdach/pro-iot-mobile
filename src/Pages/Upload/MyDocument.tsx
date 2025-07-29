import React, { useEffect, useState } from "react";
import { CircularProgress, Typography, Box, Button, Fab } from "@mui/material";
import TreeDocument from "../../Component/TreeDocument";
import UploadHeader from "./Header";
import callDocu from "../../Services/callDocu";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from '@mui/icons-material/Download';


interface RawNode {
  name: string;
  fullPath: string;
  isFolder: boolean;
  children: RawNode[];
}

interface TreeNode {
  id?: string;
  name: string;
  children?: TreeNode[];
  fullPath:string
  isFolder:boolean
}

// const initData:TreeNode[]  = [
//   {
//     name: "2022",
//     fullPath: "D:\\AppDocument\\2022",
//     isFolder: true,
//     children: [
//       {
//         name: "10",
//         fullPath: "D:\\AppDocument\\2022\\10",
//         isFolder: true,
//         children: [
//           {
//             name: "IN2022-05777",
//             fullPath: "D:\\AppDocument\\2022\\10\\IN2022-05777",
//             isFolder: true,
//             children: [
//               {
//                 name: "IN2022-05777_638025733928735977.jpg",
//                 fullPath:"D:\\AppDocument\\2022\\10\\IN2022-05777\\IN2022-05777_638025733928735977.jpg",
//                 isFolder: false,
//                 children: [],
//               },
//               // ... รายการไฟล์อื่น ๆ
//             ],
//           },
//         ],
//       },
//     ],
//   },
//   // ... โฟลเดอร์อื่น ๆ
// ];

export default function UploadPage() {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  const [fileCountMap, setFileCountMap] = useState<Record<string, number>>({});
  const [lastModifiedMap, setLastModifiedMap] = useState<Record<string, string>>({});
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const navigate = useNavigate();

  // 🔁 ฟังก์ชันแปลงข้อมูลจาก API เป็น TreeNode[]
  const convertToTreeNode = (node: RawNode): TreeNode => ({
      id: node.fullPath, // ใช้ fullPath เป็น id เพราะไม่ซ้ำ
      name: node.name || "Root",
      children: node.children?.length ? node.children.map(convertToTreeNode) : undefined,
      fullPath: node.fullPath,
      isFolder: node.isFolder
  });

  useEffect(() => {
    async function fetchTree() {
      try {
        const treeRes = await callDocu.get("/FileManager/tree");
        const root: RawNode = treeRes.data;

        const convertedTree: TreeNode[] = root.children.map(convertToTreeNode); // เริ่มจาก root.children

        setTreeData(convertedTree);

        // (optional) set fileCountMap, lastModifiedMap ได้ในอนาคต

      } catch (error) {
        console.error("❌ Error fetching tree document:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTree();
  }, []);

  const handleUploadClick = () => {
    navigate("/UploadFile"); // เปลี่ยนเป็น path ที่ต้องการไปหน้าอัพโหลดไฟล์
  };

  const onToggleSelect = (path: string) => {
    setSelectedPaths((prev) =>
      prev.includes(path)
        ? prev.filter((p) => p !== path)
        : [...prev, path]
    );
  };

  const handleDownload = async () => {
    if (selectedPaths.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "กรุณาเลือกไฟล์",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    for (const path of selectedPaths) {
      try {
        const fileName = path.split("\\").pop(); // ดึงชื่อไฟล์
        const res = await axios.get(
          `/FileManager/tree`,
          {
            params: { path },
            responseType: "blob",
          }
        );
        saveAs(res.data, fileName || "downloaded-file");
      } catch (err) {

        Swal.fire({
              icon: 'error',
              title: `เกิดข้อผิดพลาด`,
              text: `Download failed for: "${path}"`,
              confirmButtonColor: '#d33',
            });
        
      }
    }
  };



  return (
    <>
      <UploadHeader title="My Document" />
      <Box sx={{ p: 2, marginTop: 5, marginBottom: 8 }}>

        {/* <Button
          variant="contained"
          color="primary"
          onClick={handleUploadClick}
          sx={{ mb: 2 }}
          fullWidth
        >
          Upload File
        </Button> */}

        {selectedPaths.length > 0 ? (
        <Fab
          aria-label="add"
          sx={{
            position: "fixed",
            bottom: 75,
            right: 20,
            width: 45,
            height: 45,
            backgroundColor: '#2086c1ff',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#2086c1ff',
            },
            boxShadow: 3,
          }}
          onClick={handleDownload}
        >
          <DownloadIcon />
        </Fab>
      ) : (
        <Fab
          aria-label="add"
          sx={{
            position: "fixed",
            bottom: 75,
            right: 20,
            width: 45,
            height: 45,
            backgroundColor: '#163299ff',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#0f2569',
            },
            boxShadow: 3,
          }}
          onClick={handleUploadClick}
        >
          <AddIcon />
        </Fab>
      )}


        {loading ? (
          <CircularProgress />
        ) : (
          <TreeDocument
            data={treeData}
            selectedPaths={selectedPaths}
            onToggleSelect={onToggleSelect}
            lastSelectedIndex={lastSelectedIndex}
            setLastSelectedIndex={setLastSelectedIndex}
            
            // fileCountMap={fileCountMap}
            // lastModifiedMap={lastModifiedMap}
          />
        )}

        
      </Box>

    </>
  );
}
