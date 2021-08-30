import React, { useState } from 'react';
import { Warehouse } from "../Warehouse";
import { dialogBoxCreate } from "../../../utils/DialogBox";
import { createElement } from "../../../utils/uiHelpers/createElement";
import { removePopup } from "../../ui/React/createPopup";
import { createOptionElement } from "../../../utils/uiHelpers/createOptionElement";
import { clearSelector } from "../../../utils/uiHelpers/clearSelector";
import { getSelectText,
         getSelectValue } from "../../../utils/uiHelpers/getSelectData";
import { MaterialSizes } from "../MaterialSizes";
import { numeralWrapper } from "../../ui/numeralFormat";

interface IBulkPurchaseTextProps {
    warehouse: any;
    mat: any;
    amount: string;
}

function BulkPurchaseText(props: IBulkPurchaseTextProps): React.ReactElement {
    const parsedAmt = parseFloat(props.amount);
    const cost = parsedAmt * props.mat.bCost;

    const matSize = MaterialSizes[props.mat.name];
    const maxAmount = ((props.warehouse.size - props.warehouse.sizeUsed) / matSize);

    if (parsedAmt * matSize > maxAmount) {
        return (<>Not enough warehouse space to purchase this amount</>);
    } else if (isNaN(cost)) {
        return (<>Invalid put for Bulk Purchase amount</>);
    } else {
        return (<>Purchasing {numeralWrapper.format(parsedAmt, "0,0.00")} of 
            {props.mat.name} will cost {numeralWrapper.formatMoney(cost)}</>);
    }
}

interface IProps {
    mat: any;
    industry: any;
    warehouse: any;
    corp: any;
    popupId: string;
}

function BulkPurchase(props: IProps): React.ReactElement {
    const [buyAmt, setBuyAmt] = useState('');

    function bulkPurchase(): void {
        const amount = parseFloat(buyAmt);

        const matSize = MaterialSizes[props.mat.name];
        const maxAmount = ((props.warehouse.size - props.warehouse.sizeUsed) / matSize);
        if (amount * matSize > maxAmount) {
            dialogBoxCreate(`You do not have enough warehouse size to fit this purchase`);
            return;
        }

        if (isNaN(amount)) {
            dialogBoxCreate("Invalid input amount");
        } else {
            const cost = amount * props.mat.bCost;
            if (props.corp.funds.gt(cost)) {
                props.corp.funds = props.corp.funds.minus(cost);
                props.mat.qty += amount;
            } else {
                dialogBoxCreate(`You cannot afford this purchase.`);
                return;
            }

            removePopup(props.popupId);
        }
    }

    function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
        if (event.keyCode === 13) bulkPurchase();
    }

    function onChange(event: React.ChangeEvent<HTMLInputElement>): void {
        setBuyAmt(event.target.value);
    }

    return (<>
        <p>
            Enter the amount of {props.mat.name} you would like
            to bulk purchase. This purchases the specified amount instantly
            (all at once).
        </p>
        <BulkPurchaseText warehouse={props.warehouse} mat={props.mat} amount={buyAmt} />
        <input onChange={onChange} type="number" placeholder="Bulk Purchase amount" style={{margin: "5px"}} />
        <button className="std-button">Confirm Bulk Purchase</button>
    </>);
}

// Create a popup that lets the player purchase a Material
export function PurchaseMaterialPopup(props: IProps): React.ReactElement {
    const [buyAmt, setBuyAmt] = useState(props.mat.buy ? props.mat.buy : null);
    
    function purchaseMaterial(): void {
        if (isNaN(parseFloat(buyAmt))) {
            dialogBoxCreate("Invalid amount");
        } else {
            props.mat.buy = parseFloat(buyAmt);
            if (isNaN(props.mat.buy)) props.mat.buy = 0;
            removePopup(props.popupId);
        }
    }

    function clearPurchase(): void {
        props.mat.buy = 0;
        removePopup(props.popupId);
    }

    function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
        if (event.keyCode === 13) purchaseMaterial();
    }

    function onChange(event: React.ChangeEvent<HTMLInputElement>): void {
        setBuyAmt(event.target.value);
    }

    return (<>
        <p>
            Enter the amount of {props.mat.name} you would like
            to purchase per second. This material's cost changes constantly.
        </p>
        <input onChange={onChange} className="text-input" autoFocus={true} placeholder="Purchase amount" type="number" style={{margin: "5px"}} onKeyDown={onKeyDown} />
        <button onClick={purchaseMaterial} className="std-button">Confirm</button>
        <button onClick={clearPurchase} className="std-button">Clear Purchase</button>
        {props.industry.hasResearch("Bulk Purchasing") && <BulkPurchase corp={props.corp} mat={props.mat} industry={props.industry} warehouse={props.warehouse} popupId={props.popupId} />}
    </>);
}
