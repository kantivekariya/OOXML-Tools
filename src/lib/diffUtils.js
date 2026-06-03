import { applySyntaxHighlighting } from './xmlUtils';

export function computeDiff(lines1, lines2) {
  const m = lines1.length;
  const n = lines2.length;
  const dp = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (lines1[i - 1] === lines2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const diff = [];
  let i = m,
    j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && lines1[i - 1] === lines2[j - 1]) {
      diff.unshift({ type: 'equal', value: lines1[i - 1] });
      i--;
      j--;
    } else if (i > 0 && (j === 0 || dp[i - 1][j] >= dp[i][j - 1])) {
      diff.unshift({ type: 'delete', value: lines1[i - 1] });
      i--;
    } else {
      diff.unshift({ type: 'insert', value: lines2[j - 1] });
      j--;
    }
  }

  return diff;
}

export function generateProfessionalDiff(content1, content2) {
  const lines1 = content1.split('\n');
  const lines2 = content2.split('\n');
  const diff = computeDiff(lines1, lines2);

  const leftLines = [];
  const rightLines = [];
  const stats = { added: 0, removed: 0 };

  let lineNum1 = 1;
  let lineNum2 = 1;

  diff.forEach((change) => {
    if (change.type === 'equal') {
      const line = applySyntaxHighlighting(change.value);
      leftLines.push({ lineNum: lineNum1, html: line, type: 'equal' });
      rightLines.push({ lineNum: lineNum2, html: line, type: 'equal' });
      lineNum1++;
      lineNum2++;
    } else if (change.type === 'delete') {
      const line = applySyntaxHighlighting(change.value);
      leftLines.push({ lineNum: lineNum1, html: line, type: 'delete' });
      rightLines.push({ lineNum: null, html: '&nbsp;', type: 'placeholder' });
      lineNum1++;
      stats.removed++;
    } else if (change.type === 'insert') {
      const line = applySyntaxHighlighting(change.value);
      leftLines.push({ lineNum: null, html: '&nbsp;', type: 'placeholder' });
      rightLines.push({ lineNum: lineNum2, html: line, type: 'insert' });
      lineNum2++;
      stats.added++;
    }
  });

  return { leftLines, rightLines, stats };
}
