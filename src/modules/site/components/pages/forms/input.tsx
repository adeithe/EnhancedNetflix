import * as React from "react";

interface IProps {
	placeholder?: string;
	value?: string | number;
	name?: string;
	id?: string;
	type?: string;
	readOnly?: boolean;
	disabled?: boolean;
	style?: React.CSSProperties;
}

const Input: React.FunctionComponent<IProps> = ({ placeholder = '', value = '', name = '', id = '', type = 'text', readOnly, disabled, style = {} }) => (
	<div className={'form-textfield'} style={style}>
		<div className={'form-input-base'}>
			<input placeholder={placeholder} name={name} id={id} type={type} className={'form-input-outlined'} readOnly={readOnly} disabled={disabled} value={value} />
			<fieldset className={'form-input-outline'}>
				<legend><span>{'\u200B'}</span></legend>
			</fieldset>
		</div>
	</div>
);

export default Input;