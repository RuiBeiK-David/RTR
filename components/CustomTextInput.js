import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';

const styles = StyleSheet.create({
    fieldLabel: {
        marginLeft: 10,
    },
    textInput: {
        height: 40,
        marginLeft: 10,
        width: '96%',
        marginBottom: 5, // 改小以适应错误消息
        ...Platform.select({
            ios: {
                marginTop: 4,
                paddingLeft: 10,
                borderRadius: 5,
                borderWidth: 2,
                borderColor: '#c0c0c0'
            },
            android: {}
        })
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginLeft: 10,
        marginBottom: 15
    },
    errorInput: {
        borderColor: 'red'
    }
});

class CustomTextInput extends Component {
    render() {
        const { 
            label, 
            labelStyle, 
            maxLength, 
            textInputStyle, 
            stateHolder, 
            stateFieldName, 
            value, 
            onChangeText,
            error,
            keyboardType
        } = this.props;

        return (
            <View>
                <Text style={[styles.fieldLabel, labelStyle]}>{label}</Text>
                <TextInput
                    style={[
                        styles.textInput, 
                        textInputStyle,
                        error ? styles.errorInput : null
                    ]}
                    maxLength={maxLength}
                    value={value}
                    keyboardType={keyboardType}
                    onChangeText={(text) => {
                        if (onChangeText) {
                            onChangeText(text);
                        }
                        if (stateHolder && stateFieldName) {
                            stateHolder.setState({ [stateFieldName]: text });
                        }
                    }}
                />
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>
        );
    }
}

CustomTextInput.propTypes = {
    label: PropTypes.string.isRequired,
    labelStyle: PropTypes.object,
    maxLength: PropTypes.number,
    textInputStyle: PropTypes.object,
    stateHolder: PropTypes.object,
    stateFieldName: PropTypes.string,
    value: PropTypes.string,
    onChangeText: PropTypes.func,
    error: PropTypes.string,
    keyboardType: PropTypes.string
};

export default CustomTextInput;

