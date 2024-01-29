import { html, svg } from "lit";
import { individualSecondarySpan } from "./spans/individualSecondarySpan";
import { NewDur, TemplatesObj } from "../type";
import { PowerFlowCardPlusConfig } from "../power-flow-card-plus-config";
import { computeIndividualFlowRate } from "../utils/computeFlowRate";
import { showLine } from "../utils/showLine";
import { IndividualObject } from "../states/raw/individual/getIndividualObject";
import { PowerFlowCardPlus } from "../power-flow-card-plus";
import { styleLine } from "../utils/styleLine";
import { checkHasBottomIndividual } from "../utils/computeIndividualPosition";
import { checkShouldShowDots } from "../utils/checkShouldShowDots";

interface TopIndividual {
  newDur: NewDur;
  templatesObj: TemplatesObj;
  individualObj?: IndividualObject;
  displayState: string;
  battery: any;
  individualObjs: IndividualObject[];
}

export const individualRightBottomElement = (
  main: PowerFlowCardPlus,
  config: PowerFlowCardPlusConfig,
  { individualObj, templatesObj, displayState, newDur, battery, individualObjs }: TopIndividual
) => {
  if (!individualObj) return html`<div class="spacer"></div>`;

  const indexOfIndividual = config?.entities?.individual?.findIndex((e) => e.entity === individualObj.entity) || -1;
  if (indexOfIndividual === -1) return html`<div class="spacer"></div>`;

  const duration = newDur.individual[indexOfIndividual] || 1.66;

  const hasBottomRow = !!battery?.has || checkHasBottomIndividual(config, individualObjs);

  return html`<div class="circle-container individual-bottom individual-right individual-right-bottom">
    <div
      class="circle"
      @click=${(e: { stopPropagation: () => void }) => {
        main.openDetails(e, individualObj?.entity);
      }}
      @keyDown=${(e: { key: string; stopPropagation: () => void }) => {
        if (e.key === "Enter") {
          main.openDetails(e, individualObj?.entity);
        }
      }}
    >
      ${individualSecondarySpan(main.hass, main, config, templatesObj, individualObj, 3, "right-bottom")}
      <ha-icon id="individual-right-bottom-icon" .icon=${individualObj.icon}></ha-icon>
      ${individualObj?.field?.display_zero_state !== false || (individualObj.state || 0) > (individualObj.displayZeroTolerance ?? 0)
        ? html` <span class="individual-bottom individual-right-bottom">
            ${individualObj?.showDirection
              ? html`<ha-icon class="small" .icon=${individualObj.invertAnimation ? "mdi:arrow-down" : "mdi:arrow-up"}></ha-icon>`
              : ""}${displayState}
          </span>`
        : ""}
    </div>
    <span class="label">${individualObj.name}</span>
    ${showLine(config, individualObj.state || 0)
      ? html`
          <div class="right-individual-flow-container">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" class="right-individual-flow">
              <path
                id="individual-bottom-right-home"
                class="${styleLine(individualObj.state || 0, config)}"
                d="M45,100 v-15 c0,-30 -10,-30 -30,-30 h-20"
                vector-effect="non-scaling-stroke"
              />
              ${checkShouldShowDots(config) && individualObj.state
                ? svg`<circle
                    r="1"
                    class="individual-bottom"
                    vector-effect="non-scaling-stroke"
                    >

                    <animateMotion
                    dur="${computeIndividualFlowRate(individualObj?.field?.calculate_flow_rate, duration)}s"
                    repeatCount="indefinite"
                    calcMode="linear"
                    keyPoints=${individualObj.invertAnimation ? "0;1" : "1;0"}
                    keyTimes="0;1"
                    >
                    <mpath xlink:href="#individual-bottom-right-home" />
                    </animateMotion>
                    </circle>`
                : ""}
            </svg>
          </div>
        `
      : ""}
  </div>`;
};
