import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text, TouchableOpacity } from 'react-native';

class CustomButton extends Component {
    render() {
        const { text, onPress, buttonStyle, textStyle, width, disabled } = this.props;

        return (
            <TouchableOpacity
                style={[
                    {
                        padding: 10,
                        height: 60,
                        borderRadius: 8,
                        margin: 10,
                        width: width,
                        backgroundColor: disabled ? '#e0e0e0' : '#303656',
                    },
                    buttonStyle
                ]}
                onPress={() => { if (!disabled) { onPress(); } }}
                disabled={disabled}
            >
                <Text style={[
                    {
                        color: '#ffffff',
                        fontSize: 20,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        paddingTop: 8
                    },
                    textStyle
                ]}>
                    {text}
                </Text>
            </TouchableOpacity>
        );
    }
}

CustomButton.propTypes = {
    text: PropTypes.string.isRequired,
    onPress: PropTypes.func.isRequired,
    buttonStyle: PropTypes.object,
    textStyle: PropTypes.object,
    width: PropTypes.string,
    disabled: PropTypes.bool  // 修改为正确的布尔类型
};

export default CustomButton;



