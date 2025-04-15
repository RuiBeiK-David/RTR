import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

class DeleteButton extends React.Component {
    handlePress = () => {
        console.log('Delete button pressed');
        if (this.props.onPress) {
            this.props.onPress();
        }
    };

    render() {
        const { text, width, buttonStyle, textStyle } = this.props;

        return (
            <TouchableOpacity
                style={[
                    {
                        padding: 10,
                        height: 60,
                        borderRadius: 8,
                        margin: 10,
                        width: width,
                        backgroundColor: '#e74c3c',
                    },
                    buttonStyle
                ]}
                onPress={this.handlePress}
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
                    {text || 'Delete'}
                </Text>
            </TouchableOpacity>
        );
    }
}

export default DeleteButton;
