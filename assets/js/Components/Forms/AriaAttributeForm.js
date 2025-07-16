import { useEffect, useState } from "react";
import * as Html from "../../Services/Html";
import FormFeedback from './FormFeedback';
import './AriaRoleForm.css'

export default function AriaAttributeForm(
  {
    t,
    settings,
    isDisabled,
    activeIssue,
    activeContentItem,
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
    spinbutton: ["aria-valuenow"], // doesn't seem to need a check since there's no aria-valuemin or aria-valuemax
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
  const [formComplete, setFormComplete] = useState();

  const checkMultivalueRole = () => {
    let tempErrors = [];
    let min = attributesArray['aria-valuemin'];
    let max = attributesArray['aria-valuemax'];
    let current = attributesArray['aria-valuenow'];
    let controls = attributesArray['aria-controls'];
    let autocompleteValue = attributesArray['aria-autocomplete'];
    let autocompleteValidKeyword = ["none", "list", "inline", "both"];
    let expanded = attributesArray['aria-expanded'];


    // checking min value checks. first check ensures we're not comparing empty strings
    if (min && max) {
      if(min > max){
        console.log("Im here where min is greater than max");
        tempErrors.push({ text: t('form.aria_attribute.feedback.min'), type: "error" });
      }
    }

    // current has to not be empty and also within the confines of min and max
    if(current && (current < min || current > max))
      tempErrors.push({ text: t('form.aria_attribute.feedback.current'), type: "error" });

    if(autocompleteValue && (!autocompleteValidKeyword.includes(autocompleteValue)))
      tempErrors.push({ text: t('form.aria_attribute.feedback.autocomplete.invalid'), type: "error" });

    if(expanded && (expanded != "true" && expanded != "false"))
      tempErrors.push({ text: t('form.aria_attribute.feedback.expanded.invalid'), type: "error" });

    return tempErrors;
  }

  const checkFormErrors = (attributesArray) => {
    let tempErrors = [];

    if (attributesArray.hasOwnProperty("aria-valuemin") || attributesArray.hasOwnProperty("aria-autocomplete")){
      tempErrors = checkMultivalueRole();
    }
    else if (attributesArray.hasOwnProperty("aria-checked")) {
      if (attributesArray["aria-checked"] && attributesArray["aria-checked"] != "true" && attributesArray["aria-checked"] != "false") {
        tempErrors.push({ text: t("form.aria_attribute.feedback.aria-checked.invalid"), type: "error" });
      }
    }
    else if (attributesArray.hasOwnProperty("aria-level")) {
      if (attributesArray["aria-level"] && (attributesArray["aria-level"] < 1 || isNaN(attributesArray["aria-level"]))) {
        tempErrors.push({ text: t("form.aria_attribute.feedback.aria-level.invalid"), type: "error" });
      }
    }
    else if (attributesArray.hasOwnProperty("aria-valuenow")) {
      if (attributesArray["aria-valuenow"] && isNaN(attributesArray["aria-valuenow"])) {
        tempErrors.push({ text: t("form.aria_attribute.feedback.aria-valuenow.invalid"), type: "error" });
      }
    }
    else {
      if (attributesArray["aria-selected"] && attributesArray["aria-selected"] != "true" && attributesArray["aria-selected"] != "false") {
        tempErrors.push({ text: t("form.aria_attribute.feedback.aria-checked.invalid"), type: "error" });
      }
    }

    // check if we input all the fields
    let hasEmptyValue = Object.values(attributesArray).includes("");

    if(!hasEmptyValue)
      setFormComplete(true)

    setFormErrors(tempErrors);

  }

  useEffect(() => {
    console.log('attributesArray changed:', attributesArray);
    checkFormErrors(attributesArray);
  }, [attributesArray]);

  useEffect(() => {

    const html = Html.getIssueHtml(activeIssue)

    setFormComplete(false);

    let element = Html.toElement(html);

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
    let html = Html.getIssueHtml(activeIssue)
    let element = Html.toElement(html);

    let tempAttributesArray = {...attributesArray};
    tempAttributesArray[attribute] = e.target.value;
    setAttributesArray(tempAttributesArray);

    for(const [key, value] of Object.entries(tempAttributesArray)) {
      element.setAttribute(key, value)
    }
    handleHtmlUpdate(element);
  };

  return (
    <>
        <p>Missing valid ARIA attributes for <b>{detectedTag}</b> role.</p>
        <p>
          The required attributes for <b>{detectedTag}</b> role are listed below.
        </p>
        <ul>
          {requiredAttributes.map((opt, index) => (
            <li key={index}>{opt}</li>
          ))}
        </ul>
        {requiredAttributes.map((opt, index) => (
          <>
          <label for={`attribute` + index}> {opt}:</label>
          <div className="w-100 mt-2">
            <input
              id={`attribute` + index}
              style={{ marginLeft: '15px', marginBottom: '10px', width: '200px' }}
              name={`attribute` + index}
              key={index}
              type="text"
              rule={opt}
              defaultValue={attributesArray[opt] || ""}
              onChange={(e) => { handleInput(e, opt); } }
            />
            </div>
          </>
        ))}
        <FormFeedback t={t} activeIssue={activeIssue} settings={settings} activeContentItem={activeContentItem} isDisabled={isDisabled || !formComplete} formErrors={formErrors} />
      <div className="flex-row justify-content-start mt-3 mb-3">
        <button className="btn btn-primary" disabled={!formComplete || formErrors.length > 0} onClick={handleSubmit}>{t('form.submit')}</button>
      </div>
    </>
  );
}
