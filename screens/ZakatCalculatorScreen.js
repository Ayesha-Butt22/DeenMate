import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import colors from '../constants/colors';

const { width } = Dimensions.get('window');

const ZakatCalculatorScreen = () => {
  const [selectedType, setSelectedType] = useState(null);
  const [values, setValues] = useState({ gold: '', silver: '', cash: '' });
  const [zakat, setZakat] = useState(null);

  const goldNisab = 87000; // Example Nisab in currency
  const silverNisab = 5500;

  const handleSelection = (type) => {
    setSelectedType(type);
    setZakat(null);
  };

  const handleInput = (field, value) => {
    setValues({ ...values, [field]: value.replace(/[^0-9.]/g, '') });
  };

  const resetCalculator = () => {
    setSelectedType(null);
    setValues({ gold: '', silver: '', cash: '' });
    setZakat(null);
  };

  const calculateZakat = () => {
    let total = 0;

    if (selectedType === 'gold' && values.gold) {
      total = parseFloat(values.gold) || 0;
      if (total < goldNisab) {
        Alert.alert('Not Applicable', 'Gold amount is below Nisab.');
        return;
      }
    } else if (selectedType === 'silver' && values.silver) {
      total = parseFloat(values.silver) || 0;
      if (total < silverNisab) {
        Alert.alert('Not Applicable', 'Silver amount is below Nisab.');
        return;
      }
    } else if (selectedType === 'cash' && values.cash) {
      total = parseFloat(values.cash) || 0;
    } else if (selectedType === 'all') {
      total =
        (parseFloat(values.gold) || 0) +
        (parseFloat(values.silver) || 0) +
        (parseFloat(values.cash) || 0);
    }

    if (!isNaN(total) && total > 0) {
      const zakatAmount = total * 0.025;
      setZakat(zakatAmount.toFixed(2));
    } else {
      Alert.alert('Missing Input', 'Please enter a valid amount.');
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0.00';
    return parseFloat(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Zakat Calculator</Text>
          <Text style={styles.subtitle}>
            Calculate your Zakat obligation based on your assets
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Select Asset Type</Text>
          <View style={styles.optionsContainer}>
            {[
              { type: 'gold', label: 'Gold' },
              { type: 'silver', label: 'Silver' },
              { type: 'cash', label: 'Cash' },
              { type: 'all', label: 'All' },
            ].map((item) => (
              <TouchableOpacity
                key={item.type}
                style={[
                  styles.optionButton,
                  selectedType === item.type && styles.selectedButton,
                ]}
                onPress={() => handleSelection(item.type)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedType === item.type && styles.selectedText,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {selectedType && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Enter Values</Text>
            <View style={styles.inputsContainer}>
              {(selectedType === 'gold' || selectedType === 'all') && (
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Gold Value</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    placeholder="Enter amount in your currency"
                    value={values.gold}
                    onChangeText={(val) => handleInput('gold', val)}
                    placeholderTextColor={colors.textSecondary}
                  />
                  <Text style={styles.nisabText}>
                    Nisab: {formatCurrency(goldNisab)}
                  </Text>
                </View>
              )}

              {(selectedType === 'silver' || selectedType === 'all') && (
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Silver Value</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    placeholder="Enter amount in your currency"
                    value={values.silver}
                    onChangeText={(val) => handleInput('silver', val)}
                    placeholderTextColor={colors.textSecondary}
                  />
                  <Text style={styles.nisabText}>
                    Nisab: {formatCurrency(silverNisab)}
                  </Text>
                </View>
              )}

              {(selectedType === 'cash' || selectedType === 'all') && (
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Cash & Savings</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    placeholder="Enter total amount"
                    value={values.cash}
                    onChangeText={(val) => handleInput('cash', val)}
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              )}

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.calculateBtn]}
                  onPress={calculateZakat}
                >
                  <Text style={styles.actionButtonText}>Calculate Zakat</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.resetBtn]}
                  onPress={resetCalculator}
                >
                  <Text style={[styles.actionButtonText, styles.resetText]}>
                    Reset
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {zakat !== null && (
          <View style={[styles.card, styles.resultCard]}>
            <Text style={styles.resultTitle}>Your Zakat</Text>
            <Text style={styles.resultAmount}>{formatCurrency(zakat)}</Text>
            <Text style={styles.resultNote}>
              This is 2.5% of your total eligible assets
            </Text>
            <View style={styles.divider} />
            <Text style={styles.instructionText}>
              Please distribute this amount to those in need as part of your
              Islamic obligation.
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.backgroundLight,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primaryGreen,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: '90%',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primaryGreen,
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionButton: {
    width: width * 0.43,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedButton: {
    backgroundColor: colors.primaryGreen,
    borderColor: colors.primaryGreen,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  selectedText: {
    color: '#fff',
  },
  inputsContainer: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 10,
    padding: 14,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  nisabText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  calculateBtn: {
    backgroundColor: colors.primaryGreen,
    flex: 2,
  },
  resetBtn: {
    backgroundColor: '#f5f5f5',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  resetText: {
    color: colors.textPrimary,
  },
  resultCard: {
    alignItems: 'center',
    borderColor: colors.primaryGreen,
    borderWidth: 1,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  resultAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primaryGreen,
    marginBottom: 4,
  },
  resultNote: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    width: '100%',
    marginVertical: 12,
  },
  instructionText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ZakatCalculatorScreen;