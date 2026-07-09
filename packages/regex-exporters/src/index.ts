/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ExportSnippet {
  language: string;
  code: string;
  extension: string;
}

export function generateExporters(regex: string, flags: string): ExportSnippet[] {
  const escapedDoubleQuotes = regex.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const escapedJava = regex.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const escapedPhp = regex.replace(/'/g, "\\'");
  
  let htmlPattern = regex;
  if (htmlPattern.startsWith('^')) htmlPattern = htmlPattern.substring(1);
  if (htmlPattern.endsWith('$')) htmlPattern = htmlPattern.substring(0, htmlPattern.length - 1);
  const escapedHtml = htmlPattern.replace(/"/g, '&quot;');

  const pythonFlags = flags.includes('i') ? ', re.IGNORECASE' : '';

  return [
    {
      language: 'JavaScript',
      extension: 'js',
      code: `// Define regular expression with flags
const regex = /${regex}/${flags};

// Sample text to match
const text = "sample text here";

// Execute regex search
const match = regex.exec(text);

if (match) {
  console.log("Match found! Full Match:", match[0]);
  if (match.groups) {
    console.log("Named groups:", match.groups);
  }
} else {
  console.log("No match found.");
}`,
    },
    {
      language: 'TypeScript',
      extension: 'ts',
      code: `// Define type-safe RegExp object
const regex: RegExp = /${regex}/${flags};

const text: string = "sample text here";
const match: RegExpExecArray | null = regex.exec(text);

if (match) {
  console.log("Match found! Full Match:", match[0]);
  const groups = match.groups;
  if (groups) {
    console.log("Named Groups:", groups);
  }
} else {
  console.log("No match found.");
}`,
    },
    {
      language: 'Python',
      extension: 'py',
      code: `import re

# Compile the pattern
pattern = re.compile(r"${escapedDoubleQuotes}"${pythonFlags})

text = "sample text here"

# Search within text
match = pattern.search(text)

if match:
    print("Match found! Full Match:", match.group(0))
    print("Capture Groups:", match.groups())
else:
    print("No match found.")`,
    },
    {
      language: 'Go',
      extension: 'go',
      code: `package main

import (
\t"fmt"
\t"regexp"
)

func main() {
\t// Compile regex (using backticks for raw string)
\tre := regexp.MustCompile(\`${regex}\`)
\t
\ttext := "sample text here"
\t
\tif re.MatchString(text) {
\t\tfmt.Println("Match found!")
\t\tmatches := re.FindStringSubmatch(text)
\t\tfmt.Println("Full Match:", matches[0])
\t} else {
\t\tfmt.Println("No match found.")
\t}
}`,
    },
    {
      language: 'Rust',
      extension: 'rs',
      code: `use regex::Regex;

fn main() {
    // Compile regex (requires 'regex' crate in Cargo.toml)
    let re = Regex::new(r"${regex}").unwrap();
    
    let text = "sample text here";
    
    if re.is_match(text) {
        println!("Match found!");
        if let Some(caps) = re.captures(text) {
            println!("Full Match: {}", &caps[0]);
        }
    } else {
        println!("No match found.");
    }
}`,
    },
    {
      language: 'Java',
      extension: 'java',
      code: `import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class RegexExample {
    public static void main(String[] args) {
        Pattern pattern = Pattern.compile("${escapedJava}"${flags.includes('i') ? ', Pattern.CASE_INSENSITIVE' : ''});
        
        String text = "sample text here";
        Matcher matcher = pattern.matcher(text);
        
        if (matcher.find()) {
            System.out.println("Match found! Full Match: " + matcher.group(0));
        } else {
            System.out.println("No match found.");
        }
    }
}`,
    },
    {
      language: 'PHP',
      extension: 'php',
      code: `<?php
$pattern = '/${escapedPhp}/${flags}';

$text = 'sample text here';

if (preg_match($pattern, $text, $matches)) {
    echo "Match found! Full Match: " . $matches[0] . "\\n";
    print_r($matches);
} else {
    echo "No match found.\\n";
}
?>`,
    },
    {
      language: 'C#',
      extension: 'cs',
      code: `using System;
using System.Text.RegularExpressions;

class Program
{
    static void Main()
    {
        string pattern = @"${regex}";
        string text = "sample text here";
        
        RegexOptions options = RegexOptions.Compiled${flags.includes('i') ? ' | RegexOptions.IgnoreCase' : ''};
        Regex rx = new Regex(pattern, options);
        
        Match match = rx.Match(text);
        if (match.Success)
        {
            Console.WriteLine("Match found! Full Match: " + match.Value);
        }
        else
        {
            Console.WriteLine("No match found.");
        }
    }
}`,
    },
    {
      language: 'Ruby',
      extension: 'rb',
      code: `# Compile pattern with option flags
pattern = /${regex}/${flags}

text = "sample text here"

match = pattern.match(text)
if match
  puts "Match found! Full Match: #{match[0]}"
else
  puts "No match found."
end`,
    },
    {
      language: 'HTML Pattern',
      extension: 'html',
      code: `<!-- Use in native HTML forms for native browser validation -->
<form action="/submit">
  <label for="pattern-input">Regex Validated Field:</label>
  <input 
    type="text" 
    id="pattern-input" 
    name="input_field" 
    pattern="${escapedHtml}" 
    title="Input must match regex: ${escapedHtml}"
    required
  />
  <button type="submit">Submit</button>
</form>`,
    },
    {
      language: 'Zod Schema',
      extension: 'ts',
      code: `import { z } from 'zod';

// Define schema with regex validation
export const textSchema = z.string().regex(/${regex}/${flags}, {
  message: "Text does not match required format"
});

// Validate input safely
const checkInput = (input: string) => {
  const result = textSchema.safeParse(input);
  if (result.success) {
    console.log("Valid input:", result.data);
  } else {
    console.error("Validation error:", result.error.errors[0].message);
  }
};`,
    },
    {
      language: 'Yup Schema',
      extension: 'ts',
      code: `import * as yup from 'yup';

// Create schema with regex matcher validation
export const textSchema = yup.string().matches(/${regex}/${flags}, {
  message: "Text does not match required format",
  excludeEmptyString: true
});

// Validate input asynchronously
textSchema.validate("sample text here")
  .then(valid => {
    console.log("Validation succeeded:", valid);
  })
  .catch(err => {
    console.error("Validation failed:", err.message);
  });`,
    },
    {
      language: 'Ajv Schema',
      extension: 'ts',
      code: `import Ajv from 'ajv';

const ajv = new Ajv();

const schema = {
  type: "object",
  properties: {
    value: { type: "string", pattern: "${escapedDoubleQuotes}" }
  },
  required: ["value"],
  additionalProperties: false
};

const validate = ajv.compile(schema);

const data = { value: "sample text here" };
const valid = validate(data);

if (valid) {
  console.log("Validation succeeded!");
} else {
  console.error("Validation failed:", validate.errors);
}`,
    },
    {
      language: 'JSON Schema',
      extension: 'json',
      code: `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "RegexPatternSchema",
  "type": "object",
  "properties": {
    "value": {
      "type": "string",
      "pattern": "${escapedDoubleQuotes}"
    }
  },
  "required": ["value"]
}`,
    },
  ];
}
