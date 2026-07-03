# Spec-Drive Development Bake-off

## PHASE ONE -- Initial Development

Follow the standard approach for the framework, to design and build the specifications in `saasify-spec.md`.

![[saasify-spec.md]]

---

## PHASE TWO -- The Delta Spec Test

Once the framework successfully builds the code for the spec above, modify this markdown file by pasting the following text at the bottom and running the update tool:

```markdown

## 5. Change Request (Delta Spec #1)
* Add a new optional field to the `Subscription` model: `category` (Enum: `DEVELOPER`, `PRODUCTIVITY`, `MARKETING`, `INFRASTRUCTURE`).
* Add a third metric card to the dashboard showing the "Top Spending Category" based on active monthly costs.
```

### What to check when the code compiles:

1. Did it invent a backend database? If you didn't specify a backend stack, watch whether the framework smartly defaults to local state/localStorage or over-engineers a full PostgreSQL integration you didn't ask for.

2. Did it handle the annual math? Check the calculation component to see if it handled floating-point division cleanly without rounding errors on the monthly breakdown.

3. Did the toggle work? When you switch the header user from Admin to Viewer, do the "Add/Delete" buttons instantly vanish?

