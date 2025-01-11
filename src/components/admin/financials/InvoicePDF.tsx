import { useMemo } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
} from "@react-pdf/renderer";

interface InvoicePDFProps {
  invoice: any;
  template: any;
}

export const InvoicePDF = ({ invoice, template }: InvoicePDFProps) => {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        page: {
          padding: 30,
          fontFamily: template?.style?.fontFamily || "Helvetica",
        },
        header: {
          marginBottom: 20,
        },
        companyName: {
          fontSize: 24,
          color: template?.style?.primaryColor || "#000000",
          marginBottom: 10,
        },
        invoiceTitle: {
          fontSize: 20,
          marginBottom: 20,
          color: template?.style?.secondaryColor || "#666666",
        },
        section: {
          marginBottom: 20,
        },
        row: {
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 5,
        },
        label: {
          color: template?.style?.secondaryColor || "#666666",
        },
        value: {
          color: template?.style?.primaryColor || "#000000",
        },
        footer: {
          marginTop: 40,
          borderTopWidth: 1,
          borderTopColor: template?.style?.secondaryColor || "#666666",
          paddingTop: 10,
        },
      }),
    [template]
  );

  return (
    <PDFViewer style={{ width: "100%", height: "500px" }}>
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.companyName}>
              {template?.header?.companyName || "Gym Name"}
            </Text>
            <Text style={styles.invoiceTitle}>Invoice #{invoice.invoice_number}</Text>
          </View>

          {template?.body?.showMemberDetails && (
            <View style={styles.section}>
              <Text style={styles.label}>Member Details</Text>
              <Text style={styles.value}>{invoice.profiles?.full_name}</Text>
            </View>
          )}

          {template?.body?.showPlanDetails && (
            <View style={styles.section}>
              <Text style={styles.label}>Membership Plan</Text>
              <Text style={styles.value}>{invoice.membership_plans?.name}</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Amount</Text>
                <Text style={styles.value}>${invoice.amount}</Text>
              </View>
            </View>
          )}

          {template?.footer?.showTerms && (
            <View style={styles.footer}>
              <Text style={styles.label}>{template.footer.terms}</Text>
            </View>
          )}
        </Page>
      </Document>
    </PDFViewer>
  );
};