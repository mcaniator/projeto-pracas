import React from "react";

export default class Question extends React.Component {
    constructor(props) {
        super(props);

        this.props.onDataChange({
            "nome": "Categoria 3",
            "perguntas": []
        });
    }

    render() {
        return (
            <div>
                <ul>
                    {this.props.data.map(e => <li>{e.nome}</li>)}
                </ul>
            </div>
        );
    }
}