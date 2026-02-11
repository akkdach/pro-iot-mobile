import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import moment from 'moment';

// Register Sarabun font for Thai support (Local file in public/fonts)
Font.register({
    family: 'Sarabun',
    fonts: [
        { src: '/fonts/Sarabun-Regular.ttf' },
        { src: '/fonts/Sarabun-Regular.ttf', fontWeight: 'bold' } // Using Regular for bold as fallback to ensure rendering
    ]
});

// Create styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        border: '5px solid #GOLD',
        fontFamily: 'Sarabun' // Set global font for the page
    },
    border: {
        border: '4px double #DAA520', // Goldenrod
        width: '100%',
        height: '95%', // Reduce height slightly to avoid page break if padding causes content overflow
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        fontSize: 30,
        marginBottom: 10,
        fontWeight: 'bold',
        color: '#333',
        textTransform: 'uppercase'
    },
    subHeader: {
        fontSize: 16,
        marginBottom: 20,
        color: '#666'
    },
    name: {
        fontSize: 26,
        marginBottom: 15,
        fontWeight: 'bold',
        color: '#000',
        textDecoration: 'underline'
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
        color: '#2E8B57' // SeaGreen
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
                <View style={styles.border}>
                    <Text style={styles.header}>Certificate of Completion</Text>
                    <Text style={styles.subHeader}>This is to certify that</Text>

                    <Text style={styles.name}>{userName}</Text>

                    <Text style={styles.text}>has successfully completed the quiz</Text>
                    <Text style={{ ...styles.name, fontSize: 24, textDecoration: 'none' }}>{courseName}</Text>

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
