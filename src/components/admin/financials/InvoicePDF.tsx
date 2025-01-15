import { useMemo } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  Image,
} from "@react-pdf/renderer";

interface InvoicePDFProps {
  invoice: any;
  template: any;
  gymDetails?: {
    logo_url?: string;
    gym_name?: string;
    gym_address?: string;
    gym_phone?: string;
  };
}

export const InvoicePDF = ({ invoice, template, gymDetails }: InvoicePDFProps) => {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        page: {
          padding: 30,
          fontFamily: template?.style?.fontFamily || "Helvetica",
        },
        header: {
          marginBottom: 20,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
        },
        logo: {
          width: 100,
          height: 50,
          objectFit: "contain",
        },
        companyInfo: {
          flex: 1,
          marginLeft: 20,
        },
        companyName: {
          fontSize: 24,
          color: template?.style?.primaryColor || "#000000",
          marginBottom: 10,
        },
        companyDetails: {
          fontSize: 10,
          color: template?.style?.secondaryColor || "#666666",
          marginBottom: 5,
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
          flex: 1,
        },
        value: {
          color: template?.style?.primaryColor || "#000000",
          flex: 2,
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
            {template?.header?.showLogo && gymDetails?.logo_url && (
              <Image src={gymDetails.logo_url} style={styles.logo} />
            )}
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>
                {gymDetails?.gym_name || template?.header?.companyName || "Gym Name"}
              </Text>
              {template?.header?.showAddress && gymDetails?.gym_address && (
                <Text style={styles.companyDetails}>{gymDetails.gym_address}</Text>
              )}
              {template?.header?.showPhone && gymDetails?.gym_phone && (
                <Text style={styles.companyDetails}>{gymDetails.gym_phone}</Text>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.invoiceTitle}>Invoice #{invoice.invoice_number}</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Date Created:</Text>
              <Text style={styles.value}>
                {new Date(invoice.created_at).toLocaleDateString()}
              </Text>
            </View>
            {invoice.due_date && (
              <View style={styles.row}>
                <Text style={styles.label}>Due Date:</Text>
                <Text style={styles.value}>
                  {new Date(invoice.due_date).toLocaleDateString()}
                </Text>
              </View>
            )}
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
              <View style={styles.row}>
                <Text style={styles.label}>Status</Text>
                <Text style={styles.value}>{invoice.status}</Text>
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