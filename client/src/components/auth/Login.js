import React, {Component} from 'react';

class Login extends Component {
    render() {
        return (
            <div className={"login"}>
                <div className={"container"}>
                    <div className={"row"}>
                        <div className={"col-md-8 m-auto"}>
                            <h1 className={"display-4 text-center"}>Login</h1>
                            <p className={"lead text-center"}>
                               Login your account
                            </p>


                            <div className={"form-group"}>
                                <input
                                    type={"text"}
                                    className={"form-control form-control-lg"}
                                    placeholder={"Email Address"}
                                />
                            </div>

                            <div className={"form-group"}>
                                <input
                                    type={"text"}
                                    className={"form-control form-control-lg"}
                                    placeholder={"Password"}
                                />
                            </div>
                            
                            <input
                                type="submit"
                                className={"btn btn-info btn-block mt-4"}
                            />

                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Login;