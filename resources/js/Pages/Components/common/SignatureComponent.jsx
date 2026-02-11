import { Button } from "antd";
import React, { useRef, useState } from "react";
import ReactSignatureCanvas from "react-signature-canvas";

function SignatureComponent() {
    const signRef = useRef();

    const ClearSignature = () => {
        signRef.current.clear();
    };
    const SaveSignature = () => {
        const SignData = signRef.current.toDataURL();
        setSignData(SignData);
    };
    return (
        <div className="bg-white border rounded-none p-4 lg:w-[550px] w-1/2 ">
            <div className="border m-2">
                <ReactSignatureCanvas
                    ref={signRef}
                    penColor="black"
                    canvasProps={{
                        width: 500,
                        height: 200,
                        className: "signature-canvas",
                    }}
                />
            </div>

            <div className="flex justify-end space-x-2">
                <Button onClick={ClearSignature}>Clear</Button>
                <Button onClick={SaveSignature}>Save</Button>
            </div>
        </div>
    );
}

export default SignatureComponent;
