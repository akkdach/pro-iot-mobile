export const CloseWorkMaster = (type: any) => {
    const masterData = [
        // {
        //   label: 'เลือกการปิดงาน',
        //   value: '',
        //   orderType: [
        //     'ZC00',
        //     'BN00',
        //     'ZC01',
        //     'BN01',
        //     'ZC02',
        //     'BN02',
        //     'ZC03',
        //     'BN03',
        //     'ZC04',
        //     'BN04',
        //     'ZC09',
        //     'BN09',
        //     'ZC15',
        //     'BN15',
        //     'ZC16',
        //     'BN16',
        //   ],
        // },
        // {
        //   label: 'ปิดงานแบบปกติ',
        //   value: '1',
        //   orderType: [
        //     'ZC00',
        //     'BN00',
        //     'ZC01',
        //     'BN01',
        //     'ZC02',
        //     'BN02',
        //     'ZC03',
        //     'BN03',
        //     'ZC04',
        //     'BN04',
        //     'ZC09',
        //     'BN09',
        //     'ZC15',
        //     'BN15',
        //     'ZC16',
        //     'BN16',
        //   ],
        // },
        {
            label: 'ปิดงานกรณีตู้ CCP',
            value: '2',
            checked: true,
            orderType: [
                'ZC01',
                'BN01',
                'ZC02',
                'BN02',
                'ZC03',
                'BN03',
                'ZC09',
                'BN09',
            ],
        },
        {
            label: 'ไม่ปิดงานเพราะติดปัญหาด้านเทคนิค',
            value: '3',
            orderType: [
                'ZC01',
                'BN01',
                'ZC02',
                'BN02',
                'ZC03',
                'BN03',
                'ZC04',
                'BN04',
                'ZC09',
                'BN09',
            ],
        },
        {
            label: 'ไม่ปิดงานเพราะค้างอะไหล่',
            value: '4',
            orderType: [
                'ZC01',
                'BN01',
                'ZC02',
                'BN02',
                'ZC03',
                'BN03',
                'ZC04',
                'BN04',
                'ZC15',
                'BN15',
                'ZC16',
                'BN16',
            ],
        },
        {
            label: 'ปิดงานพร้อมแจ้งเปลี่ยนอุปกรณ์',
            value: '5',
            orderType: ['ZC01', 'BN01', 'ZC02', 'BN02', 'ZC03', 'BN03'],
        },
        {
            label: 'ปิดงานแบบหมายเลขอุปกรณ์ไม่ตรง',
            value: '6',
            orderType: [
                'ZC01',
                'BN01',
                'ZC02',
                'BN02',
                'ZC03',
                'BN03',
                'ZC09',
                'BN09',
            ],
        },
        {
            label: 'ปิดงานแบบติดตั้งไม่สำเร็จ',
            value: '7',
            orderType: ['ZC04', 'BN04'],
        },
        {
            label: 'ปิดงานแบบถอดถอนไม่สำเร็จ',
            value: '8',
            orderType: ['ZC09', 'BN09'],
        },
        {
            label: 'ปิดงานแบบพื้นที่พร้อมติดตั้งบางเครื่อง',
            value: '9',
            orderType: ['ZC00', 'BN00'],
        },
        {
            label: 'ปิดงานแบบพื้นที่ไม่พร้อมติดตั้ง',
            value: '10',
            orderType: ['ZC00', 'BN00'],
        },
        {
            label: 'ปิดงานแบบสำรวจไม่สำเร็จ',
            value: '11',
            orderType: ['ZC00', 'BN00'],
        },
        {
            label: 'ปิดงานแบบเปลี่ยนตู้โยกย้าย',
            value: '12',
            orderType: ['ZC01', 'BN01', 'ZC02', 'BN02', 'ZC03', 'BN03'],
        },
        {
            label: 'ปิดงานแบบลูกค้าแจ้งคืนตู้',
            value: '13',
            orderType: ['ZC01', 'BN01', 'ZC02', 'BN02', 'ZC03', 'BN03'],
        },
        {
            label: 'ปิดงานแบบ verify สำเร็จ',
            value: '14',
            orderType: ['ZC15', 'BN15'],
        },
        {
            label: 'ปิดงานแบบ set up ไม่สำเร็จ',
            value: '15',
            orderType: ['ZC16', 'BN16'],
        },
        {
            label: 'ปิดงานแบบปกติแบบระบุ Code',
            value: '16',
            orderType: ['ZC04', 'BN04'],
        },
        {
            label: 'ปิดงานแบบ Phone Fix',
            value: '17',
            orderType: ['ZC02', 'ZC03', 'BN02', 'BN03'],
        },
        {
            label: 'ปิดงานแบบ Phone Fix ไม่สำเร็จ',
            value: '18',
            orderType: ['ZC02', 'ZC03', 'BN02', 'BN03'],
        },
    ];

    let data: any = [];
    masterData.map(val => {
        if (val.orderType.includes(type)) {
            data.push(val);
        }
    });

    return data;
};