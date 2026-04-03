import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors, { Shadows } from '@/constants/Colors';
import GradientHeader from '@/components/ui/GradientHeader';
import { LOAN_TERMS } from '@/constants/Config';

function formatRupiah(num: number): string {
  return 'Rp ' + num.toLocaleString('id-ID');
}

function parseNumber(text: string): number {
  return Number(text.replace(/[^0-9]/g, '')) || 0;
}

export default function CalculatorScreen() {
  const insets = useSafeAreaInsets();
  const [carPrice, setCarPrice] = useState('300000000');
  const [dpPercent, setDpPercent] = useState(20);
  const [loanTerm, setLoanTerm] = useState(48);
  const [interestRate, setInterestRate] = useState('6.5');
  const [showResult, setShowResult] = useState(false);

  const result = useMemo(() => {
    const price = parseNumber(carPrice);
    const dp = price * (dpPercent / 100);
    const loan = price - dp;
    const rate = parseFloat(interestRate) || 0;
    const totalInterest = loan * (rate / 100) * (loanTerm / 12);
    const totalPayment = loan + totalInterest;
    const monthly = totalPayment / loanTerm;

    return {
      carPrice: price,
      downPayment: dp,
      loanAmount: loan,
      totalInterest,
      totalPayment,
      monthlyPayment: monthly,
    };
  }, [carPrice, dpPercent, loanTerm, interestRate]);

  const dpOptions = [10, 15, 20, 25, 30, 35];

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        <GradientHeader
          title="Kalkulator Kredit"
          subtitle="Simulasi pembiayaan mobil impian Anda"
          height={140}
        />

        <View style={styles.content}>
          {/* Car Price Input */}
          <View style={[styles.card, Shadows.medium]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconBg}>
                <Ionicons name="car-sport" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.cardTitle}>Harga Mobil</Text>
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputPrefix}>Rp</Text>
              <TextInput
                style={styles.priceInput}
                value={parseNumber(carPrice).toLocaleString('id-ID')}
                onChangeText={(text) => setCarPrice(text.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={Colors.textTertiary}
              />
            </View>
          </View>

          {/* Down Payment */}
          <View style={[styles.card, Shadows.medium]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconBg}>
                <Ionicons name="wallet" size={20} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Uang Muka (DP)</Text>
                <Text style={styles.dpAmount}>{formatRupiah(result.downPayment)}</Text>
              </View>
              <View style={styles.percentBadge}>
                <Text style={styles.percentText}>{dpPercent}%</Text>
              </View>
            </View>
            <View style={styles.dpOptions}>
              {dpOptions.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.dpChip,
                    dpPercent === opt && styles.dpChipActive,
                  ]}
                  onPress={() => setDpPercent(opt)}
                >
                  <Text
                    style={[
                      styles.dpChipText,
                      dpPercent === opt && styles.dpChipTextActive,
                    ]}
                  >
                    {opt}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Loan Term */}
          <View style={[styles.card, Shadows.medium]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconBg}>
                <Ionicons name="calendar" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.cardTitle}>Tenor Cicilan</Text>
            </View>
            <View style={styles.termOptions}>
              {LOAN_TERMS.map((term) => (
                <TouchableOpacity
                  key={term}
                  style={[
                    styles.termChip,
                    loanTerm === term && styles.termChipActive,
                  ]}
                  onPress={() => setLoanTerm(term)}
                >
                  <Text
                    style={[
                      styles.termText,
                      loanTerm === term && styles.termTextActive,
                    ]}
                  >
                    {term / 12} Thn
                  </Text>
                  <Text
                    style={[
                      styles.termSubText,
                      loanTerm === term && styles.termSubTextActive,
                    ]}
                  >
                    {term} bln
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Interest Rate */}
          <View style={[styles.card, Shadows.medium]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconBg}>
                <Ionicons name="trending-up" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.cardTitle}>Suku Bunga (% / tahun)</Text>
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.priceInput, { textAlign: 'center' }]}
                value={interestRate}
                onChangeText={setInterestRate}
                keyboardType="decimal-pad"
                placeholder="6.5"
                placeholderTextColor={Colors.textTertiary}
              />
              <Text style={styles.inputSuffix}>%</Text>
            </View>
          </View>

          {/* Calculate Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setShowResult(true)}
          >
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.calculateBtn, Shadows.blue]}
            >
              <Ionicons name="calculator" size={22} color={Colors.white} />
              <Text style={styles.calculateBtnText}>Hitung Cicilan</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Result */}
          {showResult && (
            <View style={[styles.resultCard, Shadows.large]}>
              <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientMiddle]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.resultHeader}
              >
                <Text style={styles.resultHeaderTitle}>Estimasi Cicilan Bulanan</Text>
                <Text style={styles.monthlyAmount}>
                  {formatRupiah(Math.round(result.monthlyPayment))}
                </Text>
                <Text style={styles.monthlyLabel}>per bulan selama {loanTerm / 12} tahun</Text>
              </LinearGradient>

              <View style={styles.resultBody}>
                {[
                  { label: 'Harga Mobil', value: result.carPrice, icon: 'car' as const },
                  { label: 'Uang Muka (DP)', value: result.downPayment, icon: 'wallet' as const },
                  { label: 'Pokok Pinjaman', value: result.loanAmount, icon: 'cash' as const },
                  { label: 'Total Bunga', value: result.totalInterest, icon: 'trending-up' as const },
                  { label: 'Total Bayar', value: result.totalPayment, icon: 'receipt' as const },
                ].map((item, i) => (
                  <View
                    key={i}
                    style={[
                      styles.resultRow,
                      i < 4 && styles.resultRowBorder,
                    ]}
                  >
                    <View style={styles.resultRowLeft}>
                      <View style={styles.resultIconBg}>
                        <Ionicons name={item.icon} size={16} color={Colors.primary} />
                      </View>
                      <Text style={styles.resultLabel}>{item.label}</Text>
                    </View>
                    <Text
                      style={[
                        styles.resultValue,
                        i === 4 && { color: Colors.primary, fontWeight: '900' },
                      ]}
                    >
                      {formatRupiah(Math.round(item.value))}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.disclaimer}>
                <Ionicons name="information-circle" size={16} color={Colors.textTertiary} />
                <Text style={styles.disclaimerText}>
                  * Perhitungan ini merupakan estimasi. Angka sebenarnya dapat berbeda tergantung kebijakan leasing.
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    marginTop: -12,
    gap: 14,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  cardIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  dpAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 2,
  },
  percentBadge: {
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  percentText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
  },
  inputPrefix: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginRight: 8,
  },
  inputSuffix: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginLeft: 8,
  },
  priceInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  dpOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dpChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.backgroundSecondary,
  },
  dpChipActive: {
    backgroundColor: Colors.primary,
  },
  dpChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  dpChipTextActive: {
    color: Colors.white,
  },
  termOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  termChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.backgroundSecondary,
  },
  termChipActive: {
    backgroundColor: Colors.primary,
  },
  termText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
  },
  termTextActive: {
    color: Colors.white,
  },
  termSubText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textTertiary,
    marginTop: 2,
  },
  termSubTextActive: {
    color: 'rgba(255,255,255,0.7)',
  },
  calculateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 56,
    borderRadius: 18,
    marginTop: 4,
  },
  calculateBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.white,
  },
  resultCard: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    overflow: 'hidden',
  },
  resultHeader: {
    padding: 24,
    alignItems: 'center',
  },
  resultHeaderTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  monthlyAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.white,
    marginTop: 6,
    letterSpacing: -1,
  },
  monthlyLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 4,
    fontWeight: '500',
  },
  resultBody: {
    padding: 18,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  resultRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  resultRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  resultIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.primarySoftest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    color: Colors.textTertiary,
    lineHeight: 16,
  },
});
