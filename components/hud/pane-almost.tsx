import React from 'react';

interface HUDPaneProps {
  theme?: any; // We'll define a proper theme type later
  fill?: boolean;
  flat?: boolean;
  oneLineLabels?: boolean;
  hideTitleBar?: boolean;
  collapsed?: boolean;
  hidden?: boolean;
}

const HUDPane: React.FC<HUDPaneProps> = ({
  theme,
  fill = false,
  flat = false,
  oneLineLabels = false,
  hideTitleBar = false,
  collapsed = false,
  hidden = false,
}) => {
  if (hidden) return null;

  // TODO: Implement the pane content

  return (
    <div className={`hud-pane ${fill ? 'fill' : ''} ${flat ? 'flat' : ''} ${collapsed ? 'collapsed' : ''}`}>
      {!hideTitleBar && <div className="hud-pane-title">HUD Panel</div>}
      <div className={`hud-pane-content ${oneLineLabels ? 'one-line-labels' : ''}`}>
        {/* Pane content will go here */}
      </div>
    </div>
  );
};

export default HUDPane;
