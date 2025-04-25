import React, { useEffect, useState } from "react";
import * as Html from "../../Services/Html";
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
  const [textInputErrors, setTextInputErrors] = useState([]);

  useEffect(() => {
    console.log(attributesArray)
    // CHECK FORM ERRORS USING THIS GUY
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

  const handleButton = () => {
    handleIssueSave(activeIssue);
  };

  const handleInput = (e, attribute) => {
    console.log(e)
    // console.log(e.target.key)
    // console.log(e.target.value)
    let element = Html.toElement(html);

    let tempAttributesArray = {...attributesArray};
    tempAttributesArray[attribute] = e.target.value;
    setAttributesArray(tempAttributesArray);

    element.setAttribute(attribute, e.target.value);
    handleHtmlUpdate(element);
    // console.log(element)
  };

  return (
    <div className="p-1">
      <section>
        {requiredAttributes.length === 0 ? (
          <p>No valid ARIA attributes for &lt;{detectedTag}&gt;</p>
        ) : (<section className="flex-col">
          <label>
            Required attributes for {detectedTag} role:
            <ul>
              {requiredAttributes.map((opt, index) => (
                <li key={index}>{opt}</li>
              ))}
            </ul>
            </label>
            {requiredAttributes.map((opt, index) => (
              <label for="attribute"> {opt}:
              <input
                id="attribute"
                style={{marginLeft:'15px', marginBottom: '10px', width:'200px'}}
                name="attribute"
                key={index}
                type="text"
                rule={opt}
                defaultValue={element.getAttribute(opt) || ""}
                onChange={(e) => {handleInput(e, opt)}}
              />
              </label>
            ))}
            </section>
        )}
      </section>

      <section className="mt-3">
        <button className="btn btn-primary" onClick={handleButton} disabled={formErrors.length > 0}>
          {t('form.submit')}
        </button>
      </section>
    </div>
  );
}
