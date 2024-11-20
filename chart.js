(function() {
    // Your Google Sheets ID
    const sheetId = '1DJS2ScQ7WrPQhFTbnJI9ovyYnxHfSFG25X75gR9a2Wc';

    // Sheet names for each table (Revenue Growth, EBITDA Margin)
    const sheetNames = {
        revenueGrowth: 'Revenue Growth YoY',
        ebitdaMargin: 'EBITDA_MARGIN',
    };

    // Color dictionary for companies
    const colorDict = {
        'abnb': '#ff5895',
        'almosafer': '#bb5387',
        'bkng': '#003480',
        'desp': '#755bd8',
        'expe': '#fbcc33',
        'easemytrip': '#00a0e2',
        'ixigo': '#e74c3c',
        'mmyt': '#e74c3c',
        'trip': '#00af87',
        'trvg': '#e74c3c',
        'wego': '#4e843d',
        'yatra': '#e74c3c',
        'tcom': '#2577e3',
        'edr': '#2577e3',
        'lmn': '#fc03b1',
        'webjet': '#e74c3c',
        'seera': '#750808',
        'pcln': '#003480',
        'orbitz': '#8edbfa',
        'travelocity': '#1d3e5c',
        'skyscanner': '#0770e3',
        'etraveli': '#b2e9ff',
        'kiwi': '#e5fdd4',
        'cleartrip': '#e74c3c',
        'traveloka': '#38a0e2',
        'flt': '#d2b6a8',
        'webjet ota': '#e74c3c',
    };

    // Logo dictionary for companies (ensure these paths are correct)
    const logoDict = {
        "abnb": "logos/ABNB_logo.png",
        "bkng": "logos/BKNG_logo.png",
        "expe": "logos/EXPE_logo.png",
        "tcom": "logos/TCOM_logo.png",
        "trip": "logos/TRIP_logo.png",
        "trvg": "logos/TRVG_logo.png",
        "edr": "logos/EDR_logo.png",
        "desp": "logos/DESP_logo.png",
        "mmyt": "logos/MMYT_logo.png",
        "ixigo": "logos/IXIGO_logo.png",
        "seera": "logos/SEERA_logo.png",
        "webjet": "logos/WEB_logo.png",
        "lmn": "logos/LMN_logo.png",
        "yatra": "logos/YTRA_logo.png",
        "orbitz": "logos/OWW_logo.png",
        "travelocity": "logos/Travelocity_logo.png",
        "easemytrip": "logos/EASEMYTRIP_logo.png",
        "wego": "logos/Wego_logo.png",
        "skyscanner": "logos/Skyscanner_logo.png",
        "etraveli": "logos/Etraveli_logo.png",
        "kiwi": "logos/Kiwi_logo.png",
        "cleartrip": "logos/Cleartrip_logo.png",
        "traveloka": "logos/Traveloka_logo.png",
        "flt": "logos/FlightCentre_logo.png",
        "almosafer": "logos/Almosafer_logo.png",
        "webjet ota": "logos/OTA_logo.png",
    };

    // Function to fetch data from a Google Sheet
    function fetchSheetData(sheetName) {
        const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok for sheet: ${sheetName}`);
                }
                return response.text();
            })
            .then(csvText => csvToObjects(csvText, sheetName))
            .catch(error => {
                console.error(`Error fetching sheet ${sheetName}:`, error);
                return [];
            });
    }

    // Function to parse CSV data into a usable array of objects
    function csvToObjects(csvText, sheetName) {
        const lines = csvText.split("\n").filter(line => line.trim() !== "");
        if (lines.length === 0) {
            console.warn(`Sheet ${sheetName} is empty.`);
            return [];
        }
        const headers = lines[0].split(",").map(header => header.trim().replace(/['"]+/g, ''));
        const companies = headers.slice(1);
        const data = [];
        lines.slice(1).forEach(line => {
            const cleanedLine = line.replace(/(\d+),(\d+)/g, '$1$2'); // Remove commas in numbers
            const values = cleanedLine.split(",");
            const rawQuarter = values[0] ? values[0].trim() : null;
            if (!rawQuarter) return;
            const quarter = standardizeQuarterLabel(rawQuarter);
            values.slice(1).forEach((value, i) => {
                if (value && companies[i]) {
                    const company = companies[i].trim().replace(/['"]+/g, '').toLowerCase();
                    // Include data for '2024 Q2' and '2024 Q3'
                    if (quarter !== '2024 Q3' && quarter !== '2024 Q2') return;
                    const cleanedValue = value.trim().replace(/['"$%]+/g, '');
                    const parsedValue = parseFloat(cleanedValue);
                    if (isNaN(parsedValue)) return;
                    data.push({
                        sheetName,
                        company: company,
                        quarter: quarter.toLowerCase(),
                        value: parsedValue
                    });
                }
            });
        });
        return data;
    }

    // Function to standardize quarter labels
    function standardizeQuarterLabel(quarter) {
        quarter = quarter.trim().replace(/['"]+/g, '');
        let match = quarter.match(/(\d{4})[' ]?Q([1-4])/i);
        if (match) {
            return `${match[1]} Q${match[2]}`;
        }
        match = quarter.match(/Q([1-4])[' ]?(\d{4})/i);
        if (match) {
            return `${match[2]} Q${match[1]}`;
        }
        match = quarter.match(/(\d{4})'Q([1-4])/i); // Handle formats like 2024'Q2
        if (match) {
            return `${match[1]} Q${match[2]}`;
        }
        return quarter;
    }

    // Function to merge data from the two sheets
    function mergeData(revenueGrowth, ebitdaMargin) {
        const merged = [];
        revenueGrowth.forEach(growth => {
            const company = growth.company;
            const quarter = growth.quarter;
            const ebitda = ebitdaMargin.find(e => e.company === company && e.quarter === quarter);
            if (ebitda) {
                merged.push({
                    company: growth.company, // Keep company in lowercase
                    quarter: growth.quarter,
                    revenueGrowth: growth.value / 100, // Convert percentages to decimals
                    ebitdaMargin: ebitda.value / 100,  // Convert percentages to decimals
                });
            }
        });
        return merged;
    }

    // Now fetch data and proceed with D3.js visualization
    Promise.all([
        fetchSheetData(sheetNames.revenueGrowth),
        fetchSheetData(sheetNames.ebitdaMargin),
    ]).then(([revenueGrowthData, ebitdaMarginData]) => {
        // **First SVG Declaration**
        const svg = d3.select('#additional-chart').append('svg')
            .attr('width', 1200)
            .attr('height', 840);

        console.log('Revenue Growth Data:', revenueGrowthData);
        console.log('EBITDA Margin Data:', ebitdaMarginData);

        let mergedData = mergeData(revenueGrowthData, ebitdaMarginData);
        console.log('Merged Data:', mergedData);

        // Identify companies that have both Q2 and Q3 data
        const companyQuarters = {};
        mergedData.forEach(d => {
            if (!companyQuarters[d.company]) {
                companyQuarters[d.company] = new Set();
            }
            companyQuarters[d.company].add(d.quarter);
        });

        // Add a flag to each data point indicating if the company has both quarters
        mergedData = mergedData.map(d => {
            const quarters = companyQuarters[d.company];
            return {
                ...d,
                hasBothQuarters: quarters.size > 1
            };
        });

        console.log('Merged Data with Flags:', mergedData);

        // Proceed with D3.js visualization using mergedData

        const margin = { top: 40, right: 20, bottom: 50, left: 60 };
        const width = 1200 - margin.left - margin.right;
        const height = 840 - margin.top - margin.bottom;

        const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

        // Declare scales and axes outside to make them accessible for updates
        let xScale, yScale, xAxis, yAxis;

        // **Define the drag behavior for quarter labels**
        const labelDragHandler = d3.drag()
            .on("start", labelDragStarted)
            .on("drag", labelDragged)
            .on("end", labelDragEnded);

        // **Functions for label drag events**
        function labelDragStarted(event, d) {
            d3.select(this).raise().classed("active", true);
        }

        function labelDragged(event, d) {
            let [x, y] = d3.pointer(event, g.node());

            // Constrain x and y within the chart area
            x = Math.max(0, Math.min(width, x));
            y = Math.max(0, Math.min(height, y));

            d3.select(this)
                .attr("x", x)
                .attr("y", y);
        }

        function labelDragEnded(event, d) {
            d3.select(this).classed("active", false);
        }

        // **Define the drag behavior for logos**
        const dragHandler = d3.drag()
            .on("start", dragStarted)
            .on("drag", dragged)
            .on("end", dragEnded);

        // **Functions for logo drag events**
        function dragStarted(event, d) {
            d3.select(this).raise().classed("active", true);
        }

        function dragged(event, d) {
            // Get the mouse position relative to the group 'g'
            let [x, y] = d3.pointer(event, g.node());

            // Constrain x and y within the chart area
            x = Math.max(0, Math.min(width, x));
            y = Math.max(0, Math.min(height, y));

            d3.select(this)
                .attr("x", x - 40) // Adjust to keep the logo centered
                .attr("y", y - 40); // Adjust as needed
        }

        function dragEnded(event, d) {
            d3.select(this).classed("active", false);
        }

        // **Function to update the chart**
        function updateChart() {
            // Compute min and max values for the scales
            const ebitdaMargins = mergedData.map(d => d.ebitdaMargin);
            const revenueGrowths = mergedData.map(d => d.revenueGrowth);

            if (ebitdaMargins.length === 0 || revenueGrowths.length === 0) {
                console.error('No valid data available for visualization.');
                // Clear the chart
                g.selectAll("*").remove();
                return;
            }

            const xMin = d3.min(ebitdaMargins);
            const xMax = d3.max(ebitdaMargins);
            const yMin = d3.min(revenueGrowths);
            const yMax = d3.max(revenueGrowths);

            // Add padding to the domains
            const xPadding = (xMax - xMin) * 0.1 || 0.1; // Default padding if range is 0
            const yPadding = (yMax - yMin) * 0.1 || 0.1;

            // Adjust the domains to include 0% for x and y axes
            const xDomain = [
                Math.min(xMin - xPadding, 0),
                Math.max(xMax + xPadding, 0)
            ];

            const yDomain = [
                Math.min(yMin - yPadding, 0),
                Math.max(yMax + yPadding, 0)
            ];

            // Update scales
            xScale = d3.scaleLinear()
                .domain(xDomain)
                .range([0, width]);

            yScale = d3.scaleLinear()
                .domain(yDomain)
                .range([height, 0]);

            // Update axes
            xAxis = d3.axisBottom(xScale)
                .tickFormat(d3.format(".0%"));

            yAxis = d3.axisLeft(yScale)
                .tickFormat(d3.format(".0%"));

            // Remove existing axes and zero lines
            g.selectAll(".x-axis").remove();
            g.selectAll(".y-axis").remove();
            g.selectAll(".zero-line").remove();

            // Draw x-axis
            g.append("g")
                .attr("class", "x-axis")
                .attr("transform", `translate(0, ${height})`)
                .call(xAxis)
                .selectAll(".tick text")
                .style("font-family", "Open Sans")
                .style("font-size", 14);

            // Draw y-axis
            g.append("g")
                .attr("class", "y-axis")
                .call(yAxis)
                .selectAll(".tick text")
                .style("font-family", "Open Sans")
                .style("font-size", 14);

            // **Add x-axis label**
            g.selectAll(".x-label").remove(); // Remove existing label
            g.append("text")
                .attr("class", "x-label")
                .attr("text-anchor", "middle")
                .attr("x", width / 2)
                .attr("y", height + 40)
                .text("EBITDA Margin")
                .style("font-family", "Open Sans")
                .style("font-size", 20);

            // **Add y-axis label**
            g.selectAll(".y-label").remove(); // Remove existing label
            g.append("text")
                .attr("class", "y-label")
                .attr("text-anchor", "middle")
                .attr("transform", `rotate(-90)`)
                .attr("y", -65)
                .attr("x", -height / 2)
                .attr("dy", "1em")
                .text("Revenue Growth YoY")
                .style("font-family", "Open Sans")
                .style("font-size", 20);

            // Add zero lines for x and y axes at 0%
            // Horizontal line at y = 0%
            if (yScale(0) >= 0 && yScale(0) <= height) {
                g.append("line")
                    .attr("class", "zero-line")
                    .attr("x1", 0)
                    .attr("y1", yScale(0))
                    .attr("x2", width)
                    .attr("y2", yScale(0))
                    .attr("stroke", "green")
                    .attr("stroke-width", 1)
                    .attr("stroke-dasharray", "4,2");
            }

            // Vertical line at x = 0%
            if (xScale(0) >= 0 && xScale(0) <= width) {
                g.append("line")
                    .attr("class", "zero-line")
                    .attr("x1", xScale(0))
                    .attr("y1", 0)
                    .attr("x2", xScale(0))
                    .attr("y2", height)
                    .attr("stroke", "green")
                    .attr("stroke-width", 1)
                    .attr("stroke-dasharray", "4,2");
            }

            // **Separate data for Q2 and Q3**
            const dataQ3 = mergedData.filter(d => d.quarter === '2024 q3');
            const dataQ2 = mergedData.filter(d => d.quarter === '2024 q2');

            // **Update dots for Q3**
            const dotsQ3 = g.selectAll(".dot.q3")
                .data(dataQ3, d => d.company);

            dotsQ3.enter()
                .append("circle")
                .attr("class", "dot q3")
                .attr("r", 5)
                .attr("fill", d => colorDict[d.company] || '#000000')
                .on("click", function(event, d) {
                    // Remove the data point from mergedData
                    mergedData = mergedData.filter(item => !(item.company === d.company && item.quarter === d.quarter));

                    // Remove associated elements
                    g.selectAll(".logo")
                        .filter(logoData => logoData.company === d.company)
                        .remove();

                    g.selectAll(".quarter-label")
                        .filter(labelData => labelData.company === d.company && labelData.quarter === d.quarter)
                        .remove();

                    // Update the chart
                    updateChart();
                })
                .merge(dotsQ3)
                .transition()
                .duration(500)
                .attr("cx", d => xScale(d.ebitdaMargin))
                .attr("cy", d => yScale(d.revenueGrowth));

            dotsQ3.exit().remove();

            // **Update crosses for Q2 (without logos)**
            const symbolCross = d3.symbol().type(d3.symbolCross).size(100);

            const crossesQ2 = g.selectAll(".cross.q2")
                .data(dataQ2, d => d.company);

            crossesQ2.enter()
                .append("path")
                .attr("class", "cross q2")
                .attr("d", symbolCross)
                .attr("fill", d => colorDict[d.company] || '#000000')
                .on("click", function(event, d) {
                    // Remove the data point from mergedData
                    mergedData = mergedData.filter(item => !(item.company === d.company && item.quarter === d.quarter));

                    // Remove associated elements
                    g.selectAll(".quarter-label")
                        .filter(labelData => labelData.company === d.company && labelData.quarter === d.quarter)
                        .remove();

                    // Update the chart
                    updateChart();
                })
                .merge(crossesQ2)
                .transition()
                .duration(500)
                .attr("transform", d => `translate(${xScale(d.ebitdaMargin)},${yScale(d.revenueGrowth)})`);

            crossesQ2.exit().remove();

            // **Update quarter labels (show 'Q2' and 'Q3' instead of '2024 Q2', '2024 Q3')**
            const labels = g.selectAll(".quarter-label")
                .data(mergedData, d => d.company + d.quarter);

            labels.enter()
                .append("text")
                .attr("class", "quarter-label")
                .text(d => d.quarter.toUpperCase().replace('2024 ', '')) // Remove '2024 '
                .style("font-size", "12px")
                .style("font-family", "Open Sans")
                .style("fill", "black")
                .call(labelDragHandler) // Apply drag behavior to labels
                .merge(labels)
                .transition()
                .duration(500)
                .attr("x", d => xScale(d.ebitdaMargin) + 8) // Adjust position as needed
                .attr("y", d => yScale(d.revenueGrowth) + 4); // Adjust position as needed

            labels.exit().remove();

            // **Update company logos for Q3 data only**
            const dataWithLogos = dataQ3; // Only Q3 data

            const logos = g.selectAll(".logo")
                .data(dataWithLogos, d => d.company);

            logos.enter()
                .append("image")
                .attr("class", "logo")
                .attr("xlink:href", d => logoDict[d.company] || '')
                .attr("width", 80)
                .attr("height", 80)
                .call(dragHandler) // Apply drag behavior to logos
                .merge(logos)
                .transition()
                .duration(500)
                .attr("x", d => xScale(d.ebitdaMargin) - 40) // Center the logo horizontally
                .attr("y", d => yScale(d.revenueGrowth) - 62); // Position the logo above the dot

            logos.exit().remove();

        }

        // **Initial Chart Rendering**
        updateChart();

    });
})();