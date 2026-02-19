import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Svg, Path, Circle, Defs, LinearGradient, Stop, G, Image } from '@react-pdf/renderer';
import moment from 'moment';
import logo from './PNG/bevproAsiaLogo.gif';

// Register Sarabun font for Thai support (Local file in public/fonts)
Font.register({
    family: 'Sarabun',
    fonts: [
        { src: '/fonts/Sarabun-Regular.ttf' },
        { src: '/fonts/Sarabun-Regular.ttf', fontWeight: 'bold' } // Using Regular for bold as fallback
    ]
});

// Create styles - BLUE TECH THEME
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Sarabun'
    },
    logo: {
        width: 250,
        height: 150,
        marginBottom: 20,
        objectFit: 'contain'
    },
    background: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1
    },
    border: {
        border: '3px solid #002766',
        width: '100%',
        height: '95%',
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        borderRadius: 10
    },
    header: {
        fontSize: 30,
        marginBottom: 10,
        fontWeight: 'bold',
        color: '#0050b3',
        textTransform: 'uppercase'
    },
    subHeader: {
        fontSize: 16,
        marginBottom: 20,
        color: '#555'
    },
    name: {
        fontSize: 26,
        marginBottom: 15,
        fontWeight: 'bold',
        color: '#000',
        textDecoration: 'none',
        borderBottom: '1px solid #333',
        paddingBottom: 5
    },
    text: {
        fontSize: 14,
        marginBottom: 10,
        color: '#444'
    },
    score: {
        fontSize: 18,
        marginTop: 10,
        fontWeight: 'bold',
        color: '#1890ff'
    },
    date: {
        fontSize: 12,
        marginTop: 20,
        color: '#888'
    },
    signatureSection: {
        marginTop: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
    },
    signatureLine: {
        borderTop: '1px solid #000',
        width: 200,
        textAlign: 'center',
        paddingTop: 5,
        fontSize: 12
    }
});

interface CertificateProps {
    userName: string;
    courseName: string;
    score: number;
    totalScore: number;
    date: string;
}

const CertificateDocument: React.FC<CertificateProps> = ({ userName, courseName, score, totalScore, date }) => {
    return (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>
                {/* Tech/Innovation Background - BLUE THEME */}
                <View style={styles.background}>
                    <Svg width="100%" height="100%" viewBox="0 0 842 595">
                        <Defs>
                            <LinearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                                <Stop offset="0%" stopColor="#f0f5ff" />
                                <Stop offset="100%" stopColor="#e6f7ff" />
                            </LinearGradient>
                        </Defs>

                        {/* Background Base Fill */}
                        <Path d="M0 0 H842 V595 H0 Z" fill="url(#grad1)" />

                        {/* --- 1. HEXAGON MESH OVERLAY (Dark Blue) --- */}
                        <G stroke="#003a8c" strokeWidth="1" fill="none" opacity="0.4">
                            <Path d="M50 50 L60 50 L65 58.6 L60 67.3 L50 67.3 L45 58.6 Z" />
                            <Path d="M65 58.6 L75 58.6 L80 67.3 L75 75.9 L65 75.9 L60 67.3 Z" />
                            <Path d="M80 67.3 L90 67.3 L95 75.9 L90 84.6 L80 84.6 L75 75.9 Z" />
                            {/* Scattered Hexagons */}
                            <Path d="M750 100 L760 100 L765 108.6 L760 117.3 L750 117.3 L745 108.6 Z" />
                            <Path d="M765 108.6 L775 108.6 L780 117.3 L775 125.9 L765 125.9 L760 117.3 Z" />
                            <Path d="M100 450 L110 450 L115 458.6 L110 467.3 L100 467.3 L95 458.6 Z" />
                            <Path d="M700 500 L710 500 L715 508.6 L710 517.3 L700 517.3 L695 508.6 Z" />
                            <Path d="M715 508.6 L725 508.6 L730 517.3 L725 525.9 L715 525.9 L710 517.3 Z" />
                        </G>

                        {/* --- 2. CENTRAL HUD ELEMENT (Cyber Blue Ring) --- */}
                        <G stroke="#1890ff" strokeWidth="2" opacity="0.3" fill="none">
                            <Circle cx="421" cy="297.5" r="220" strokeWidth="1" />
                            <Circle cx="421" cy="297.5" r="200" strokeDasharray="15, 10" />
                            <Circle cx="421" cy="297.5" r="180" strokeWidth="3" />
                            <Path d="M421 117.5 V90 M421 477.5 V505 M221 297.5 H190 M601 297.5 H630" strokeWidth="4" opacity="0.8" />
                        </G>

                        {/* --- 3. MAIN CIRCUIT TRACES (Deep Navy - High Contrast) --- */}
                        <G stroke="#002766" strokeWidth="2.5" fill="none" opacity="1.0">
                            {/* Top Left Complex */}
                            <Path d="M0 60 H40 L60 80 H120 L140 100 H200" />
                            <Circle cx="200" cy="100" r="5" fill="#002766" stroke="none" />
                            <Circle cx="40" cy="60" r="4" fill="#002766" stroke="none" />

                            <Path d="M60 0 V30 L90 60 V100 L110 120 V150" />
                            <Circle cx="110" cy="150" r="5" fill="#002766" stroke="none" />

                            {/* Bottom Right Complex */}
                            <Path d="M842 535 H800 L780 515 H720 L700 495 H640" />
                            <Circle cx="640" cy="495" r="5" fill="#002766" stroke="none" />

                            <Path d="M782 595 V565 L752 535 V495 L732 475 V445" />
                            <Circle cx="732" cy="445" r="5" fill="#002766" stroke="none" />

                            {/* Side Connectors */}
                            <Path d="M0 300 H50 L80 330" />
                            <Circle cx="80" cy="330" r="5" fill="#002766" stroke="none" />

                            <Path d="M842 295 H792 L762 265" />
                            <Circle cx="762" cy="265" r="5" fill="#002766" stroke="none" />
                        </G>

                        {/* --- 4. DATA LINES & ACCENTS (Electric Blue) --- */}
                        <G stroke="#40a9ff" strokeWidth="2" strokeDasharray="6,4" opacity="0.9">
                            <Path d="M200 100 L250 100 L270 120" />
                            <Path d="M640 495 L590 495 L570 475" />
                            <Path d="M110 150 V180" />
                            <Path d="M732 445 V415" />
                        </G>

                        {/* --- 5. TECH CORNER FRAME (Midnight Blue) --- */}
                        <G stroke="#001529" strokeWidth="5" fill="none" strokeLinecap="square">
                            {/* Top Left */}
                            <Path d="M30 100 V30 H100" />
                            {/* Top Right */}
                            <Path d="M742 30 H812 V100" />
                            {/* Bottom Right */}
                            <Path d="M812 495 V565 H742" />
                            {/* Bottom Left */}
                            <Path d="M100 565 H30 V495" />
                        </G>

                        {/* --- 6. GLOWING NODES (Cyan Accent) --- */}
                        <G fill="#bae7ff">
                            <Circle cx="30" cy="30" r="6" />
                            <Circle cx="812" cy="30" r="6" />
                            <Circle cx="812" cy="565" r="6" />
                            <Circle cx="30" cy="565" r="6" />
                        </G>
                    </Svg>
                </View>

                {/* Content Layer */}
                <View style={styles.border}>
                    <Image style={styles.logo} src={logo} />
                    <Text style={styles.header}>Certificate of Completion</Text>
                    <Text style={styles.subHeader}>This is to certify that</Text>

                    <Text style={styles.name}>{userName}</Text>

                    <Text style={styles.text}>has successfully completed the quiz</Text>
                    <Text style={{ ...styles.name, fontSize: 24, textDecoration: 'none', borderBottom: 'none' }}>{courseName}</Text>

                    <Text style={styles.score}>Score: {score} / {totalScore}</Text>

                    <View style={styles.signatureSection}>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 16, marginBottom: 5, fontWeight: 'bold' }}>Akkdach Narach</Text>
                            <Text style={styles.signatureLine}>Authorized Signature</Text>
                        </View>
                        <View>
                            <Text style={styles.date}>Date: {moment(date).format('DD MMMM YYYY')}</Text>
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default CertificateDocument;
