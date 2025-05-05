import React, { useEffect, useState } from "react";
import * as Html from "../../Services/Html";
import FormFeedback from './FormFeedback';
import './AriaRoleForm.css'

export default function AriaAttributeForm(
  {
    t,
    settings,
    activeIssue,
    handleActiveIssue,
    handleIssueSave,
    addMessage,
    handleManualScan
  }
) {
  // mapping of aria roles and their required aria attributes
  const AriaAttributeRequiredMap = {
    region: ["aria-label"], // if not aria-label, then aria-labelledby (same for the rest with just aria-label)
    definition: ["aria-labelledby"],
    heading: ["aria-level"],
    alertDialog: ["aria-label"],
    dialog: ["aria-label"],
    checkbox: ["aria-checked"],
    scrollbar: ["aria-valuemin", "aria-valuemax", "aria-valuenow", "aria-controls"],
    slider: ["aria-valuemin", "aria-valuemax", "aria-valuenow"],
    spinbutton: ["aria-valuenow"],
    switch: ["aria-checked"],
    tooltip: ["aria-describedby"],
    combobox: ["aria-autocomplete", "aria-expanded", "aria-controls"],
    option: ["aria-selected"],
    menuitemcheckbox: ["aria-checked"],
    menuitemradio: ["aria-checked"],
    radio: ["aria-checked"],
    tab: ["aria-selected"],
  };

  const [detectedTag, setDetectedTag] = useState("");
  const [formErrors, setFormErrors] = useState([]);
  const [requiredAttributes, setRequiredAttributes] = useState([]);
  const [attributesArray, setAttributesArray] = useState([]);

  let html = activeIssue.newHtml
    ? activeIssue.newHtml
    : activeIssue.sourceHtml;

  if (activeIssue.status === "1") {
    html = activeIssue.newHtml;
  }
  let element = Html.toElement(html);

  const [textInputValue, setTextInputValue] = useState(
    element ? Html.getAttribute(element, "role") : ""
  );

  const checkMin = (min, current, max, tempErrors) => {
    console.log("min is " + min);
    if (min != "" && max != "") {
      if(min > max){
        tempErrors.push({ text: t('form.aria_attribute.feedback.min_greater_than_max'), type: "error" });
      }
    }

    setFormErrors(tempErrors);
  }

  const checkCurrent = (min, current, max, tempErrors) => {
    if(current < min || current > max){
      tempErrors.push({ text: t('form.aria_attribute.feedback.current_value_invalid'), type: "error" });
    }

  }

  const checkControls = (controls, tempErrors) => {
    // should be controlling a valid element ID but not sure
  }

  const checkFormErrors = (attributesArray) => {
    console.log("here");
    let tempErrors = [];
    // console.log("attributesArray:" + attributesArray);
    let min = attributesArray['aria-valuemin'];
    // console.log("min is " + min);
    let max = attributesArray['aria-valuemax'];
    let current = attributesArray['aria-valuenow'];
    let controls = attributesArray['aria-controls'];

    tempErrors = checkMin(min, current, max, tempErrors);
    // tempErrors = checkMax(min, current, max, tempErrors);
    tempErrors = checkCurrent(min, current, max, tempErrors);
    tempErrors = checkControls(controls, tempErrors);

    setFormErrors(tempErrors);

  }

  useEffect(() => {
    // console.log(attributesArray);
    console.log('attributesArray changed:', attributesArray);
    checkFormErrors(attributesArray);
  }, [attributesArray]);

  useEffect(() => {
    let html = activeIssue.newHtml
      ? activeIssue.newHtml
      : activeIssue.sourceHtml;
    if (activeIssue.status === 1) {
      html = activeIssue.newHtml;
    }

    let element = Html.toElement(html);
    setTextInputValue(element ? Html.getAttribute(element, "role") : "");

    const match = Html.getAttribute(element, "role");
    console.log(match)
    let tempAttributes = []
    if (match) {
      setDetectedTag(match);
      tempAttributes = AriaAttributeRequiredMap[match];
    }
    setRequiredAttributes(tempAttributes)
    console.log(tempAttributes)

    let tempAttributesArray = {};
    tempAttributes.forEach((attribute) => {
      tempAttributesArray[attribute] = element.getAttribute(attribute) || "";
    });
    setAttributesArray(tempAttributesArray);

  }, [activeIssue]);

  useEffect(() => {
    handleHtmlUpdate();
  }, [activeIssue]);

  const handleHtmlUpdate = (element) => {

    let issue = activeIssue;
    issue.newHtml = Html.toString(element);
    handleActiveIssue(issue);
  };

  const handleSubmit = () => {
    handleIssueSave(activeIssue)
  }

  const handleInput = (e, attribute) => {
    console.log(e)
    let element = Html.toElement(html);

    let tempAttributesArray = {...attributesArray};
    tempAttributesArray[attribute] = e.target.value;
    setAttributesArray(tempAttributesArray);

    element.setAttribute(attribute, e.target.value);
    handleHtmlUpdate(element);
  };

  return (
    <>
        <p>No valid ARIA attributes for {detectedTag} role.</p>
        <p>
          Required attributes for {detectedTag} role:
        </p>
        <ul>
          {requiredAttributes.map((opt, index) => (
            <li key={index}>{opt}</li>
          ))}
        </ul>
        {requiredAttributes.map((opt, index) => (
          <>
          <label for="attribute"> {opt}:</label>
          <div className="w-100 mt-2">
            <input
              id="attribute"
              style={{ marginLeft: '15px', marginBottom: '10px', width: '200px' }}
              name="attribute"
              key={index}
              type="text"
              rule={opt}
              defaultValue={element.getAttribute(opt) || ""}
              onChange={(e) => { handleInput(e, opt); } }
            />
            </div>
          </>
        ))}
        {/* <FormFeedback issues={formErrors} /> */}
      <div className="flex-row justify-content-start mt-3 mb-3">
        <button className="btn btn-primary" onClick={handleSubmit}>{t('form.submit')}</button>
      </div>
    </>
  );
}
