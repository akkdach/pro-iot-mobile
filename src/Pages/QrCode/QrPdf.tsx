import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register Thai font
Font.register({
    family: 'Sarabun',
    src: 'https://fonts.gstatic.com/s/sarabun/v13/DtVjJx26TKEr37c9aAFJn2QN.ttf'
});

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Sarabun',
        padding: 0, // Remove padding to rely on pure centering
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // Center content horizontally on page
    },
    container: {
        width: '100%',
        height: '100%',
        border: '1px solid #000', // Add border
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // Center content group
    },
    qrSection: {
        marginRight: 5, // Tighter spacing
    },
    infoSection: {
        // Removed flex: 1 to allow container to center the whole group
        justifyContent: 'center',
        alignItems: 'center', // Center text blocks horizontally
        textAlign: 'center',
        paddingLeft: 8, // Add padding to separate from QR
        paddingRight: 2,
    },
    title: {
        fontSize: 12, // Larger to match 9pt/12px browser print
        fontWeight: 'bold',
        marginBottom: 0,
        lineHeight: 1,
    },
    subtitle: {
        fontSize: 10,
        color: '#000',
        marginBottom: 0,
        lineHeight: 1,
    },
    payload: {
        fontSize: 6,
        color: '#666',
    }
});

export interface PdfItem {
    id: string;
    title: string;
    subtitle?: string;
    qrDataUrl: string;
}

interface QrPdfDocumentProps {
    items: PdfItem[];
    // We ignore cols since we are doing 1 sticker per page (or 1 sticker size)
    // If standard printer, we might need multiple on A4, but user asked for "page size of each qr code".
    // This implies a label printer setting where the "page" is the label.
    showPayload?: boolean;
}

export const QrPdfDocument: React.FC<QrPdfDocumentProps> = ({ items, showPayload }) => {
    return (
        <Document>
            {items.map((item, i) => (
                <Page
                    key={i}
                    // size={[width, height]} in points. 
                    // 1 cm = 28.3465 pt
                    // 7.4 cm = ~209.76 pt
                    // 2.8 cm = ~79.37 pt
                    size={[209.76, 79.37]}
                    style={styles.page}
                >
                    <View style={styles.container}>
                        <View style={styles.qrSection}>
                            {/* Adjust QR size to fit height (2.8cm approx 79pt). 
                                Margin 5pt top/bott -> ~69pt available. 
                                Let's use 60pt for QR. 
                            */}
                            <Image
                                src={item.qrDataUrl}
                                style={{ width: 54, height: 54 }}
                            />
                        </View>
                        <View style={styles.infoSection}>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={{ ...styles.title, marginTop: 5, marginBottom: 5 }}>THAINAMTHIP</Text>
                            {/* Break invalid long words if necessary? react-pdf handles wrapping */}
                            {item.subtitle && <Text style={styles.subtitle}>{item.subtitle}</Text>}
                            {showPayload && (
                                <Text style={styles.payload}>
                                    {/* Payload hint if requested */}
                                    {/* (Decoding logic or raw payload string would be passed here ideally) */}
                                </Text>
                            )}
                        </View>
                    </View>
                </Page>
            ))}
        </Document>
    );
};
