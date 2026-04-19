import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors, { Shadows } from '@/constants/Colors';

export interface SearchableSelectOption {
  id: string;
  label: string;
  subtitle?: string;
}

interface SearchableSelectFieldProps {
  label: string;
  placeholder: string;
  modalTitle: string;
  selectedId?: string | null;
  selectedLabel?: string | null;
  options: SearchableSelectOption[];
  onSelect: (option: SearchableSelectOption) => void;
  disabled?: boolean;
  loading?: boolean;
  loadingMore?: boolean;
  emptyText?: string;
  searchEnabled?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onLoadMore?: () => void;
  hasNextPage?: boolean;
}

export default function SearchableSelectField({
  label,
  placeholder,
  modalTitle,
  selectedId,
  selectedLabel,
  options,
  onSelect,
  disabled = false,
  loading = false,
  loadingMore = false,
  emptyText = 'Data belum tersedia.',
  searchEnabled = false,
  searchPlaceholder = 'Cari data...',
  searchValue = '',
  onSearchChange,
  onLoadMore,
  hasNextPage = false,
}: SearchableSelectFieldProps) {
  const [visible, setVisible] = useState(false);

  const canSearch = searchEnabled && typeof onSearchChange === 'function';

  const handleClose = () => {
    setVisible(false);
  };

  const handleSelect = (option: SearchableSelectOption) => {
    onSelect(option);
    handleClose();
  };

  const handleEndReached = () => {
    if (hasNextPage && !loading && !loadingMore) {
      onLoadMore?.();
    }
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity
          activeOpacity={0.82}
          style={[styles.field, disabled && styles.fieldDisabled]}
          onPress={() => setVisible(true)}
          disabled={disabled}
        >
          <Text
            style={[
              styles.value,
              !selectedLabel && styles.placeholder,
              disabled && styles.valueDisabled,
            ]}
            numberOfLines={1}
          >
            {selectedLabel || placeholder}
          </Text>
          {loading ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Ionicons
              name="chevron-down"
              size={18}
              color={disabled ? Colors.textTertiary : Colors.textSecondary}
            />
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <Pressable style={styles.overlay} onPress={handleClose}>
          <Pressable style={[styles.sheet, Shadows.large]} onPress={() => {}}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.sheetInner}
            >
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>{modalTitle}</Text>
                <TouchableOpacity
                  activeOpacity={0.82}
                  style={styles.closeButton}
                  onPress={handleClose}
                >
                  <Ionicons name="close" size={18} color={Colors.text} />
                </TouchableOpacity>
              </View>

              {canSearch ? (
                <View style={styles.searchBox}>
                  <Ionicons
                    name="search-outline"
                    size={18}
                    color={Colors.textSecondary}
                  />
                  <TextInput
                    value={searchValue}
                    onChangeText={onSearchChange}
                    placeholder={searchPlaceholder}
                    placeholderTextColor={Colors.textTertiary}
                    style={styles.searchInput}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              ) : null}

              {loading && !options.length ? (
                <View style={styles.centerState}>
                  <ActivityIndicator color={Colors.primary} />
                </View>
              ) : (
                <FlatList
                  data={options}
                  keyExtractor={(item) => item.id}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  onEndReachedThreshold={0.35}
                  onEndReached={handleEndReached}
                  ListEmptyComponent={
                    <View style={styles.centerState}>
                      <Text style={styles.emptyText}>{emptyText}</Text>
                    </View>
                  }
                  ListFooterComponent={
                    loadingMore ? (
                      <View style={styles.footerLoading}>
                        <ActivityIndicator size="small" color={Colors.primary} />
                      </View>
                    ) : null
                  }
                  renderItem={({ item }) => {
                    const active = selectedId === item.id;

                    return (
                      <TouchableOpacity
                        activeOpacity={0.82}
                        style={[styles.option, active && styles.optionActive]}
                        onPress={() => handleSelect(item)}
                      >
                        <View style={styles.optionTextWrap}>
                          <Text
                            style={[
                              styles.optionLabel,
                              active && styles.optionLabelActive,
                            ]}
                          >
                            {item.label}
                          </Text>
                          {item.subtitle ? (
                            <Text style={styles.optionSubtitle}>
                              {item.subtitle}
                            </Text>
                          ) : null}
                        </View>
                        {active ? (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color={Colors.primary}
                          />
                        ) : null}
                      </TouchableOpacity>
                    );
                  }}
                />
              )}
            </KeyboardAvoidingView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  field: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  fieldDisabled: {
    opacity: 0.7,
  },
  value: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  valueDisabled: {
    color: Colors.textSecondary,
  },
  placeholder: {
    color: Colors.textTertiary,
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '84%',
    minHeight: '55%',
  },
  sheetInner: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  option: {
    minHeight: 58,
    borderRadius: 16,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  optionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySoft,
  },
  optionTextWrap: {
    flex: 1,
    gap: 4,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  optionLabelActive: {
    color: Colors.primaryDark,
  },
  optionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  footerLoading: {
    paddingVertical: 12,
  },
});
