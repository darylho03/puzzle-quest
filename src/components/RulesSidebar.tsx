'use client';

import { ReactNode } from 'react';

export interface Rule {
  /** Small icon/preview to render on the left of the rule. */
  icon: ReactNode;
  /** Optional small heading shown bold above the body. */
  heading?: string;
  /** Body text for the rule. */
  body: ReactNode;
}

interface Props {
  rules: Rule[];
}

export default function RulesSidebar({ rules }: Props) {
  return (
    <aside className="pq-sidebar pq-sidebar--rules">
      <h3 className="pq-sidebar-title">RULES</h3>
      <div className="pq-sidebar-list">
        {rules.map((rule, i) => (
          <div className="pq-rule" key={i}>
            <div className="pq-rule-icon">{rule.icon}</div>
            <div className="pq-rule-text">
              {rule.heading && <div className="pq-rule-heading">{rule.heading}</div>}
              <div className="pq-rule-body">{rule.body}</div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
