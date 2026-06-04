# Diagram Files

This directory contains Mermaid diagram source files (`.mmd`) for the SkillChain project report.

## Generating PNG Images

To convert Mermaid files to PNG images, you can use one of the following methods:

### Method 1: Mermaid CLI (Recommended)

```bash
# Install mermaid-cli globally
npm install -g @mermaid-js/mermaid-cli

# Generate all PNG files
cd report/diagrams
for file in *.mmd; do
    mmdc -i "$file" -o "${file%.mmd}.png" -b white -w 1200
done
```

### Method 2: Online Editor

1. Go to https://mermaid.live/
2. Paste the content of each `.mmd` file
3. Download as PNG
4. Save with the same filename but `.png` extension

### Method 3: VS Code Extension

1. Install "Markdown Preview Mermaid Support" extension
2. Open each `.mmd` file
3. Right-click → "Export Mermaid to PNG"

## File List

| Mermaid File | Output PNG | Description |
|-------------|------------|-------------|
| `dfd_level0.mmd` | `dfd_level0.png` | Level 0 Context DFD |
| `dfd_level1.mmd` | `dfd_level1.png` | Level 1 Process Decomposition |
| `dfd_level2_job_creation.mmd` | `dfd_level2_job_creation.png` | Job Creation Detail |
| `dfd_level2_proposal.mmd` | `dfd_level2_proposal.png` | Proposal Management Detail |
| `usecase_diagram.mmd` | `usecase_diagram.png` | Use Case Diagram |
| `sequence_diagram.mmd` | `sequence_diagram.png` | Sequence Diagram |

## References in Report

All diagrams are referenced in `sections/system_design.tex` with the following labels:

- `\label{fig:dfd_level0}` - Figure 4.1
- `\label{fig:dfd_level1}` - Figure 4.2
- `\label{fig:dfd_level2_job}` - Figure 4.3
- `\label{fig:dfd_level2_proposal}` - Figure 4.4
- `\label{fig:usecase}` - Figure 4.5
- `\label{fig:sequence}` - Figure 4.6