// Your Google Sheets ID
const sheetId = '1DJS2ScQ7WrPQhFTbnJI9ovyYnxHfSFG25X75gR9a2Wc';

// Sheet names for each table (Revenue Growth, EBITDA Margin, Revenue)
const sheetNames = {
    revenueGrowth: 'Revenue Growth YoY',
    ebitdaMargin: 'EBITDA_MARGIN',
    revenue: 'Revenue'
};

// Array of company symbols to be selected by default
const defaultSelectedCompanies = ["Almosafer", "Cleartrip", "EaseMyTrip", "Ixigo", "MMYT", "Skyscanner", "Wego", "Yatra"];

// Company logos mapping
const companyLogos = {
    "ABNB": "logos/ABNB_logo.png",
    "BKNG": "logos/BKNG_logo.png",
    "EXPE": "logos/EXPE_logo.png",
    "TCOM": "logos/TCOM_logo.png",
    "TRIP": "logos/TRIP_logo.png",
    "TRVG": "logos/TRVG_logo.png",
    "EDR": "logos/EDR_logo.png",
    "DESP": "logos/DESP_logo.png",
    "MMYT": "logos/MMYT_logo.png",
    "Ixigo": "logos/IXIGO_logo.png",
    "SEERA": "logos/SEERA_logo.png",
    "Webjet": "logos/WEB_logo.png",
    "LMN": "logos/LMN_logo.png",
    "Yatra": "logos/YTRA_logo.png",
    "Orbitz": "logos/OWW_logo.png",
    "Travelocity": "logos/Travelocity_logo.png",
    "EaseMyTrip": "logos/EASEMYTRIP_logo.png",
    "Wego":  "logos/Wego_logo.png",
    "Skyscanner":  "logos/Skyscanner_logo.png",
    "Etraveli":  "logos/Etraveli_logo.png",
    "Kiwi":  "logos/Kiwi_logo.png",
    "Cleartrip": "logos/Cleartrip_logo.png",
    "Traveloka": "logos/Traveloka_logo.png",
    "FLT": "logos/FlightCentre_logo.png",
    "Almosafer": "logos/Almosafer_logo.png",
    "Webjet OTA": "logos/OTA_logo.png",

    // Add other company logos here...
};

// Raw color dictionary with potential leading/trailing spaces
const color_dict_raw = {
    'ABNB': '#ff5895',
    'Almosafer': '#bb5387',
    'BKNG': '#003480',
    'DESP': '#755bd8',
    'EXPE': '#fbcc33',
    'EaseMyTrip': '#00a0e2',
    'Ixigo': '#e74c3c',
    'MMYT': '#e74c3c',
    'TRIP': '#00af87',
    'TRVG': '#e74c3c',
    'Wego': '#4e843d',
    'Yatra': '#e74c3c',
    'TCOM': '#2577e3',
    'EDR': '#2577e3',
    'LMN': '#fc03b1',
    'Webjet': '#e74c3c',
    'SEERA': '#750808',
    'PCLN': '#003480',
    'Orbitz': '#8edbfa',
    'Travelocity': '#1d3e5c',
    'Skyscanner': '#0770e3',
    'Etraveli': '#b2e9ff',
    'Kiwi': '#e5fdd4',
    'Cleartrip': '#e74c3c',
    'Traveloka': '#38a0e2',
    'FLT': '#d2b6a8',
    'Almosafer': '#ba0d86',
    'Webjet OTA': '#e74c3c',
    
};

// Mapping of company symbols to full names
const companyNames = {
    "ABNB": "Airbnb",
    "BKNG": "Booking.com",
    "EXPE": "Expedia",
    "TCOM": "Trip.com",
    "TRIP": "TripAdvisor",
    "TRVG": "Trivago",
    "EDR": "Edreams",
    "DESP": "Despegar",
    "MMYT": "MakeMyTrip",
    "Ixigo": "Ixigo",
    "SEERA": "Seera Group",
    "Webjet": "Webjet",
    "LMN": "Lastminute",
    "Yatra": "Yatra.com",
    "Orbitz": "Orbitz",
    "Travelocity": "Travelocity",
    "EaseMyTrip": "EaseMyTrip",
    "Wego": "Wego",
    "Skyscanner": "Skyscanner",
    "Etraveli": "Etraveli",
    "Kiwi": "Kiwi",
    "Cleartrip": "Cleartrip",
    "FLT": "Flight Centre",
    "Almosafer": "Almosafer",

    // Add more mappings as needed...
};

// Function to clean the color dictionary by trimming keys
function cleanColorDict(rawDict) {
    const cleanedDict = {};
    for (const [key, value] of Object.entries(rawDict)) {
        const cleanKey = key.trim();
        cleanedDict[cleanKey] = value;
    }
    return cleanedDict;
}

// Cleaned color dictionary without leading/trailing spaces
const color_dict = cleanColorDict(color_dict_raw);

// Function to fetch CSV data from Google Sheets and convert to JSON-like objects
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
        const quarter = values[0] ? values[0].trim().replace(/['"]+/g, '') : null;
        if (!quarter) return;
        values.slice(1).forEach((value, i) => {
            if (value && companies[i]) {
                const cleanedValue = value.trim().replace(/['"$%]+/g, '');
                const parsedValue = parseFloat(cleanedValue);
                if (isNaN(parsedValue)) return;
                data.push({
                    sheetName,
                    company: companies[i].trim().replace(/['"]+/g, ''),
                    quarter: quarter,
                    value: parsedValue
                });
            }
        });
    });
    return data;
}

// Function to merge data from the three sheets
function mergeData(revenueGrowth, ebitdaMargin, revenue) {
    const merged = [];
    revenueGrowth.forEach(growth => {
        const company = growth.company;
        const quarter = growth.quarter;
        const ebitda = ebitdaMargin.find(e => e.company === company && e.quarter === quarter);
        const rev = revenue.find(r => r.company === company && r.quarter === quarter);
        if (ebitda && rev) {
            merged.push({
                company,
                quarter,
                revenueGrowth: growth.value,
                ebitdaMargin: ebitda.value,
                revenue: rev.value
            });
        }
    });
    return merged;
}

// Declare global variables
let maxRevenueValue;
let isPlaying = false;
let playInterval;
let currentQuarterIndex = 0;
let uniqueQuarters;
let mergedData;
let timelineTriangle;
let xScaleTimeline;
let timelineHeight = 80; // Global height variable
let uniqueYears;
let yearIndices;
let selectedCompanies = []; // Initialize empty, will be set later

// Function to initialize company filters with default selections
function initializeCompanyFilters(sheetData) {
    const companies = [...new Set(sheetData.map(d => d.company))].sort();
    const filterContainer = d3.select("#company-filters");

    // Clear any existing filters
    filterContainer.html('');

    companies.forEach(companySymbol => {
        const id = `filter-${companySymbol}`;
        const companyName = companyNames[companySymbol] || companySymbol; // Fallback to symbol if name not found

        const label = filterContainer.append("label")
            .attr("for", id)
            .style("display", "flex")
            .style("align-items", "center")
            .style("margin-bottom", "5px"); // Optional: spacing between labels

        label.append("input")
            .attr("type", "checkbox")
            .attr("id", id)
            .attr("value", companySymbol)
            .property("checked", defaultSelectedCompanies.includes(companySymbol)) // Set based on default list
            .on("change", handleFilterChange);

        label.append("span")
            .html(`${companySymbol} - ${companyName}`); // Display symbol and name
    });

    // Initialize selectedCompanies based on defaultSelectedCompanies
    selectedCompanies = defaultSelectedCompanies.slice(); // Use a copy of defaultSelectedCompanies
}

// Function to handle filter changes (only based on checkbox state)
function handleFilterChange() {
    const checkedBoxes = d3.selectAll("#company-filters input[type='checkbox']")
        .nodes()
        .filter(d => d.checked)
        .map(d => d.value);

    selectedCompanies = checkedBoxes;

    // If no companies are selected, optionally handle it (e.g., show a message)
    if (selectedCompanies.length === 0) {
        console.warn("No companies selected. Charts will be empty.");
    }

    // Update the charts based on selected companies
    const selectedQuarter = uniqueQuarters[currentQuarterIndex];
    updateBubbleChart(selectedQuarter, mergedData);
    updateBarChart(selectedQuarter, mergedData);
    updateLineCharts(mergedData); // Update line charts
}

// Function to create the interactive timeline using D3.js
function createTimeline(quarters, mergedData, yearIndices, uniqueYears) {
    const width = document.getElementById('timeline').clientWidth;
    const height = timelineHeight; // Use the global variable
    const svg = d3.select("#timeline").append("svg")
        .attr("width", width)
        .attr("height", height);
    
    // Define the linear scale for the timeline
    xScaleTimeline = d3.scaleLinear()
        .domain([0, quarters.length - 1])
        .range([50, width - 50]);
    
    // Define tick values for every quarter
    const allTickValues = d3.range(0, quarters.length);
    
    // Define the tick format to show year labels only for Q1
    const axisBottom = d3.axisBottom(xScaleTimeline)
        .tickValues(allTickValues) // Set tick positions to all quarters
        .tickFormat(d => {
            if (yearIndices.includes(d)) {
                // Find the index of the year and return the corresponding year label
                const yearLabel = uniqueYears[yearIndices.indexOf(d)];
                return yearLabel;
            }
            return ''; // No label for other quarters
        });
    
    // Append the x-axis to the SVG
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height - 30})`)
        .call(axisBottom)
        .selectAll("text")
        .attr("transform", "rotate(0)") // No rotation needed for year labels
        .style("text-anchor", "middle"); // Center the text
    
    // Differentiate tick lengths: longer for years (Q1), shorter for other quarters
    svg.selectAll(".x-axis .tick line")
        .attr("y2", d => yearIndices.includes(d) ? 8 : 4) // Longer ticks for Q1
        .attr("stroke", "#000"); // Same color; adjust if needed
    
    // Define the path for the triangle indicator
    const trianglePath = d3.symbol().type(d3.symbolTriangle).size(200);
    
    // Define the drag behavior
    const drag = d3.drag()
        .on("drag", function (event) {
            if (isPlaying) return; // Disable dragging while playing

            // Calculate the constrained x position
            let x = Math.min(Math.max(50, event.x), width - 50);

            // Update the triangle's position (transform) based on the new x
            d3.select(this)
                .attr("transform", `translate(${x}, ${height / 2}) rotate(180)`); // Keep triangle upside down

            // Calculate the closest quarter index based on x position
            const index = Math.round(xScaleTimeline.invert(x));
            if (index >= 0 && index < quarters.length) {
                currentQuarterIndex = index;
                const selectedQuarter = quarters[index];
                updateBubbleChart(selectedQuarter, mergedData);
                updateBarChart(selectedQuarter, mergedData);
            }
    });
    
    // Create the triangle and make it draggable
    timelineTriangle = svg.append("path")
        .attr("d", trianglePath)
        .attr("transform", `translate(${xScaleTimeline(0)}, ${height / 2}) rotate(180)`) // Start at the beginning, upside down
        .attr("fill", "#7f8284")
        .attr("stroke", "#000")
        .attr("stroke-width", 1)
        .call(drag);

    // Make the timeline responsive on window resize
    window.addEventListener('resize', () => {
        const newWidth = document.getElementById('timeline').clientWidth;
        svg.attr("width", newWidth);
        xScaleTimeline.range([50, newWidth - 50]);
        svg.select(".x-axis")
            .call(axisBottom.scale(xScaleTimeline));

        // Update triangle position
        const newX = xScaleTimeline(currentQuarterIndex);
        timelineTriangle
            .attr("transform", `translate(${newX}, ${height / 2}) rotate(180)`);
    });
}

// Function to update the timeline triangle position
function updateTimelineTriangle(index) {
    const width = document.getElementById('timeline').clientWidth;
    xScaleTimeline.range([50, width - 50]);
    const x = xScaleTimeline(index);
    timelineTriangle
        .transition() // Add a smooth transition
        .duration(300)
        .attr("transform", `translate(${x}, ${timelineHeight / 2}) rotate(180)`); // Use global height
}

// Function to update the bubble chart
function updateBubbleChart(quarter, sheetData) {
    // Filter data for the selected quarter and selected companies
    const quarterData = sheetData.filter(d => d.quarter === quarter && selectedCompanies.includes(d.company));
    if (quarterData.length === 0) {
        Plotly.react('bubble-chart', [], { title: `No data available for ${quarter}` });
        return;
    }

    // Prepare the bubble data
    const bubbleData = [{
        x: quarterData.map(d => Math.min(Math.max(d.ebitdaMargin, -55), 55)),  // Cap EBITDA Margin for display
        y: quarterData.map(d => Math.min(Math.max(d.revenueGrowth, -35), 95)), // Cap Revenue Growth for display
        text: quarterData.map(d => d.company),
        mode: 'markers',
        marker: {
            size: quarterData.map(d => Math.sqrt(Math.abs(d.revenue))),
            color: quarterData.map(d => color_dict[d.company] || 'gray'), // Assign colors based on color_dict
            sizemode: 'area',
            sizeref: 2.0 * Math.max(...quarterData.map(d => Math.sqrt(Math.abs(d.revenue)))) / (40**2),
            sizemin: 4
        },
        customdata: quarterData.map(d => d.company), // Add company symbol as customdata
        hoverinfo: 'text+x+y+marker.size',
        hovertext: quarterData.map(d => `${d.company}<br>Revenue Growth: ${d.revenueGrowth}%<br>EBITDA Margin: ${d.ebitdaMargin}%<br>Revenue: $${d3.format(",")(d.revenue)}M`)
    }];

    // Prepare images for each company
    const images = quarterData.map(d => {
        const logoPath = companyLogos[d.company];
        if (!logoPath) return null; // Skip if no logo defined
        return {
            source: logoPath,
            xref: 'x',
            yref: 'y',
            x: Math.min(Math.max(d.ebitdaMargin, -55), 55),  // Adjust to capped EBITDA Margin
            y: Math.min(Math.max(d.revenueGrowth, -35), 95) + 5, // Adjust to capped Revenue Growth
            sizex: 10,
            sizey: 10,
            xanchor: 'center',
            yanchor: 'bottom',
            layer: 'above',
            sizing: 'contain', // Ensure the entire logo fits within the specified size
            opacity: 1
        };
    }).filter(img => img !== null); // Remove nulls

    // Define the layout with images
    const layout = {
        title: `Revenue Growth vs EBITDA Margin for ${quarter}`,
        xaxis: { title: 'EBITDA Margin (%)', range: [-60, 60], gridcolor: '#eee' },
        yaxis: { title: 'Revenue Growth YoY (%)', range: [-40, 110], gridcolor: '#eee' },
        margin: { t: 60, l: 80, r: 80, b: 80 },
        images: images,
        showlegend: false,
        hovermode: 'closest',
        annotations: [
            {
                xref: 'paper',
                yref: 'paper',
                x: -0.1,  // Position at bottom left corner
                y: -0.18,  // Position at bottom left corner
                xanchor: 'left',
                yanchor: 'bottom',
                text: "Note: Extreme values are capped for display: revenue growth between -30% and +100%, and EBITDA margin within ±50%.",
                showarrow: false,
                font: {
                    size: 12,
                    color: 'gray'
                }
            }
        ]
    };

    // Render the bubble chart with images
    Plotly.react('bubble-chart', bubbleData, layout, {responsive: true});
}

function updateBarChart(quarter, sheetData) {
    const fixedBarHeight = 30; // Fixed height for each bar
    const barPadding = 10; // Padding between bars
    const maxChartHeight = 600; // Optional: Maximum height before enabling scroll
    const margin = { top: 30, right: 50, bottom: 50, left: 50 };

    const quarterData = sheetData
        .filter(d => d.quarter === quarter && selectedCompanies.includes(d.company))
        .sort((a, b) => b.revenue - a.revenue);

    const numberOfCompanies = quarterData.length;
    const calculatedHeight = margin.top + margin.bottom + numberOfCompanies * (fixedBarHeight + barPadding);
    const chartHeight = Math.min(calculatedHeight, maxChartHeight);
    const isScrollable = calculatedHeight > maxChartHeight;

    const chartContainer = d3.select("#bar-chart");
    chartContainer
        .style("height", `${chartHeight}px`)
        .style("overflow-y", isScrollable ? "auto" : "hidden");

    let svg = chartContainer.select("svg");
    if (svg.empty()) {
        const width = chartContainer.node().clientWidth;

        svg = chartContainer.append("svg")
            .attr("width", width)
            .attr("height", calculatedHeight); 

        svg.append("g").attr("class", "y-axis");
        svg.append("g").attr("class", "bar-labels");

        // Add title to the bar chart
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", margin.top / 2)
            .attr("text-anchor", "middle")
            .attr("class", "chart-title")
            .style("font-size", "16px")
            .text(`Revenue for ${quarter}`);  // Dynamic title with the selected quarter

        window.addEventListener('resize', () => {
            const newWidth = chartContainer.node().clientWidth;
            svg.attr("width", newWidth);
            x.range([margin.left, newWidth - margin.right]);

            svg.select(".x-axis")
                .attr("transform", `translate(0,${chartHeight - margin.bottom})`)
                .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format("$.2s")));

            svg.selectAll(".bar")
                .attr("width", d => x(d.revenue) - x(0));
            svg.selectAll(".bar-label")
                .attr("x", d => x(d.revenue) + 5);

            // Reposition title on resize
            svg.select(".chart-title")
                .attr("x", newWidth / 2);
        });
    } else {
        svg.attr("height", calculatedHeight);
        svg.select(".chart-title").text(`Revenue for ${quarter}`);
    }

    const width = parseInt(svg.attr("width"));
    const height = parseInt(svg.attr("height"));

    const x = d3.scaleLinear()
        .domain([0, maxRevenueValue])
        .range([margin.left, width - margin.right]);

    const y = d3.scaleBand()
        .domain(quarterData.map(d => d.company))
        .range([margin.top, margin.top + numberOfCompanies * (fixedBarHeight + barPadding)])
        .padding(0.1);

    svg.select(".x-axis")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .transition()
        .duration(500)
        .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format("$.2s")));

    svg.select(".y-axis")
        .attr("transform", `translate(${margin.left},0)`)
        .transition()
        .duration(500)
        .call(d3.axisLeft(y));

    const bars = svg.selectAll(".bar")
        .data(quarterData, d => d.company);

    bars.transition()
        .duration(500)
        .attr("x", x(0))
        .attr("y", d => y(d.company))
        .attr("height", y.bandwidth())
        .attr("width", d => x(d.revenue) - x(0))
        .style("fill", d => color_dict[d.company] || '#2E86C1');

    bars.enter().append("rect")
        .attr("class", "bar")
        .attr("x", x(0))
        .attr("y", d => y(d.company))
        .attr("height", y.bandwidth())
        .attr("width", d => x(d.revenue) - x(0))
        .style("fill", d => color_dict[d.company] || '#2E86C1')
        .on("mouseover", function(event, d) {
            d3.select(this).style("fill", d3.rgb(color_dict[d.company] || '#2E86C1').darker(1));
            showTooltip(event, `${d.company}<br>Revenue: $${d3.format(",")(d.revenue)}M`);
        })
        .on("mousemove", function(event) {
            moveTooltip(event);
        })
        .on("mouseout", function(event, d) {
            d3.select(this).style("fill", color_dict[d.company] || '#2E86C1');
            hideTooltip();
        });

    bars.exit()
        .transition()
        .duration(500)
        .attr("width", 0)
        .remove();

    const labels = svg.selectAll(".bar-label")
        .data(quarterData, d => d.company);

    labels.exit()
        .transition()
        .duration(500)
        .attr("x", x(0))
        .remove();

    labels.transition()
        .duration(500)
        .attr("x", d => x(d.revenue) + 5)
        .attr("y", d => y(d.company) + y.bandwidth() / 2)
        .text(d => d3.format("$.2s")(d.revenue));

    labels.enter().append("text")
        .attr("class", "bar-label")
        .attr("x", d => x(d.revenue) + 5)
        .attr("y", d => y(d.company) + y.bandwidth() / 2)
        .attr("dy", ".35em")
        .attr("font-size", "12px")
        .attr("fill", "black")
        .text(d => d3.format("$.2s")(d.revenue))
        .on("mouseover", function(event, d) {
            showTooltip(event, `${d.company}<br>Revenue: $${d3.format(",")(d.revenue)}M`);
        })
        .on("mousemove", function(event) {
            moveTooltip(event);
        })
        .on("mouseout", function(event, d) {
            hideTooltip();
        });
}

function updateLineCharts(mergedData) {
    // Prepare the data for the line charts
    const quarters = [...new Set(mergedData.map(d => d.quarter))];

    // Sort the quarters in chronological order
    quarters.sort((a, b) => {
        const [aYear, aQuarter] = a.match(/(\d{4})Q([1-4])/).slice(1,3).map(Number);
        const [bYear, bQuarter] = b.match(/(\d{4})Q([1-4])/).slice(1,3).map(Number);
        return (aYear - bYear) || (aQuarter - bQuarter);
    });
    
    // For each selected company, create traces for each metric
    const ebitdaMarginTraces = [];
    const revenueGrowthTraces = [];
    const revenueTraces = [];
    
    selectedCompanies.forEach(company => {
        const companyData = mergedData.filter(d => d.company === company);
        
        // Ensure data is sorted by quarter
        companyData.sort((a, b) => {
            const aIndex = quarters.indexOf(a.quarter);
            const bIndex = quarters.indexOf(b.quarter);
            return aIndex - bIndex;
        });
        
        // Get x (quarters) and y (values)
        const x = companyData.map(d => d.quarter);
        const yEbitdaMargin = companyData.map(d => d.ebitdaMargin);
        const yRevenueGrowth = companyData.map(d => d.revenueGrowth);
        const yRevenue = companyData.map(d => d.revenue);
        
        // Create traces for EBITDA Margin
        ebitdaMarginTraces.push({
            x: x,
            y: yEbitdaMargin,
            mode: 'lines+markers',
            name: company, // Use ticker symbol instead of full company name
            line: { color: color_dict[company] || 'gray' },
            hovertemplate: `%{x}<br>${company}<br>EBITDA Margin: %{y}%<extra></extra>` // Use ticker symbol
        });
        
        // Create traces for Revenue Growth
        revenueGrowthTraces.push({
            x: x,
            y: yRevenueGrowth,
            mode: 'lines+markers',
            name: company, // Use ticker symbol
            line: { color: color_dict[company] || 'gray' },
            hovertemplate: `%{x}<br>${company}<br>Revenue Growth: %{y}%<extra></extra>` // Use ticker symbol
        });
        
        // Create traces for Revenue
        revenueTraces.push({
            x: x,
            y: yRevenue,
            mode: 'lines+markers',
            name: company, // Use ticker symbol
            line: { color: color_dict[company] || 'gray' },
            hovertemplate: `%{x}<br>${company}<br>Revenue: $%{y:,}M<extra></extra>` // Use ticker symbol
        });
    });
    
    // Define layouts for each chart with categoryorder and categoryarray
    const layoutEbitdaMargin = {
        title: 'EBITDA Margin Over Time',
        xaxis: { 
            title: 'Quarter', 
            tickangle: -45,
            categoryorder: 'array',
            categoryarray: quarters
        },
        yaxis: { title: 'EBITDA Margin (%)' },
        hovermode: 'x unified',
        margin: { t: 50, l: 80, r: 50, b: 100 }
    };
    
    const layoutRevenueGrowth = {
        title: 'Revenue Growth Over Time',
        xaxis: { 
            title: 'Quarter', 
            tickangle: -45,
            categoryorder: 'array',
            categoryarray: quarters
        },
        yaxis: { title: 'Revenue Growth YoY (%)' },
        hovermode: 'x unified',
        margin: { t: 50, l: 80, r: 50, b: 100 }
    };
    
    const layoutRevenue = {
        title: 'Revenue Over Time',
        xaxis: { 
            title: 'Quarter', 
            tickangle: -45,
            categoryorder: 'array',
            categoryarray: quarters
        },
        yaxis: { title: 'Revenue (in Millions)' },
        hovermode: 'x unified',
        margin: { t: 50, l: 80, r: 50, b: 100 }
    };
    
    // Plot the charts using Plotly
    Plotly.react('line-chart-ebitda-margin', ebitdaMarginTraces, layoutEbitdaMargin, { responsive: true });
    Plotly.react('line-chart-revenue-growth', revenueGrowthTraces, layoutRevenueGrowth, { responsive: true });
    Plotly.react('line-chart-revenue', revenueTraces, layoutRevenue, { responsive: true });
}
// Function to handle the Play/Pause button
function handlePlayPause() {
    const playButton = document.getElementById('play-button');
    const playIcon = playButton.querySelector('i');
    if (isPlaying) {
        // Pause the auto-play
        clearInterval(playInterval);
        playButton.textContent = '';
        playButton.appendChild(playIcon);
        playButton.appendChild(document.createTextNode(' Play'));
        isPlaying = false;
    } else {
        // Start the auto-play
        playButton.textContent = '';
        playButton.appendChild(playIcon);
        playButton.appendChild(document.createTextNode(' Pause'));
        isPlaying = true;
        playInterval = setInterval(() => {
            currentQuarterIndex = (currentQuarterIndex + 1) % uniqueQuarters.length;
            const selectedQuarter = uniqueQuarters[currentQuarterIndex];
            
            // Update the position of the triangle on the timeline
            updateTimelineTriangle(currentQuarterIndex);
            
            // Update the bubble and bar charts based on selected companies
            updateBubbleChart(selectedQuarter, mergedData);
            updateBarChart(selectedQuarter, mergedData);
        }, 500); // Adjusted interval to accommodate transition durations
    }
}

// Tooltip Functions
const tooltip = d3.select("#chart-tooltip");

function showTooltip(event, content) {
    tooltip
        .html(content)
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 28) + "px")
        .transition()
        .duration(200)
        .style("opacity", .9);
}

function moveTooltip(event) {
    tooltip
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 28) + "px");
}

function hideTooltip() {
    tooltip
        .transition()
        .duration(500)
        .style("opacity", 0);
}

// Debounce Function to limit the rate of function execution
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

// Enhanced Search Functionality with Debounce and Highlighting
d3.select("#search-input").on("input", debounce(function() {
    const searchTerm = this.value.trim().toLowerCase();

    d3.selectAll("#company-filters label")
        .style("display", function() {
            const companySymbol = d3.select(this).select("input").attr("value");
            const companyName = companyNames[companySymbol] || companySymbol;

            // Check if either symbol or name includes the search term
            const symbolMatch = companySymbol.toLowerCase().includes(searchTerm);
            const nameMatch = companyName.toLowerCase().includes(searchTerm);

            if (symbolMatch || nameMatch) {
                // Highlight matching parts
                let displayText = `${companySymbol} - ${companyName}`;

                if (searchTerm !== "") {
                    const regex = new RegExp(`(${searchTerm})`, 'gi');
                    displayText = displayText.replace(regex, '<span class="highlight">$1</span>');
                }

                d3.select(this).select("span").html(displayText);
                return "flex";
            } else {
                // Remove any existing highlights and hide the label
                d3.select(this).select("span").html(`${companySymbol} - ${companyName}`);
                return "none";
            }
        });
}, 300)); // 300ms delay

// Select All and Deselect All Button Functions
d3.select("#select-all").on("click", () => {
    d3.selectAll("#company-filters input[type='checkbox']")
        .property("checked", true)
        .each(function() {
            const company = this.value;
            if (!selectedCompanies.includes(company)) {
                selectedCompanies.push(company);
            }
        });
    updateBubbleChart(uniqueQuarters[currentQuarterIndex], mergedData);
    updateBarChart(uniqueQuarters[currentQuarterIndex], mergedData);
    updateLineCharts(mergedData); // Update line charts
});

d3.select("#deselect-all").on("click", () => {
    d3.selectAll("#company-filters input[type='checkbox']")
        .property("checked", false);
    selectedCompanies = [];
    updateBubbleChart(uniqueQuarters[currentQuarterIndex], mergedData);
    updateBarChart(uniqueQuarters[currentQuarterIndex], mergedData);
    updateLineCharts(mergedData); // Update line charts
});

// Initialize Tooltip for Play Button
const playTooltip = d3.select("#play-tooltip");

d3.select("#play-button")
    .on("mouseover", function() {
        playTooltip
            .style("opacity", 1)
            .style("left", (d3.event.pageX + 10) + "px")
            .style("top", (d3.event.pageY - 10) + "px")
            .text(isPlaying ? "Click to Pause" : "Click to Play");
    })
    .on("mousemove", function(event) {
        playTooltip
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
    })
    .on("mouseout", function() {
        playTooltip
            .style("opacity", 0);
    });

// Event listener for the Play/Pause button
document.getElementById('play-button').addEventListener('click', handlePlayPause);

// Fetch data from all three sheets (Revenue Growth, EBITDA Margin, Revenue)
Promise.all([
    fetchSheetData(sheetNames.revenueGrowth),
    fetchSheetData(sheetNames.ebitdaMargin),
    fetchSheetData(sheetNames.revenue)
]).then(([revenueGrowthData, ebitdaMarginData, revenueData]) => {
    mergedData = mergeData(revenueGrowthData, ebitdaMarginData, revenueData);
    uniqueQuarters = [...new Set(mergedData.map(d => d.quarter))].sort(); // Ensure chronological order

    if (uniqueQuarters.length === 0) {
        console.error("No quarters available in the merged data.");
        d3.select("#charts-container").html("<p>No data available to display.</p>");
        return;
    }

    // Set default quarter to 2024Q3
    const defaultQuarter = "2024Q3";
    const defaultQuarterIndex = uniqueQuarters.indexOf(defaultQuarter);
    if (defaultQuarterIndex !== -1) {
        currentQuarterIndex = defaultQuarterIndex;
    } else {
        console.warn(`${defaultQuarter} not found in data; defaulting to the first available quarter.`);
        currentQuarterIndex = 0; // Fallback to the first quarter if 2024Q3 is not found
    }

    // Extract unique years based on the quarter format "1998Q1"
    uniqueYears = [...new Set(uniqueQuarters.map(q => {
        const match = q.match(/^(\d{4})Q([1-4])$/);
        return match ? match[1] : ""; // Extract year before 'Q'
    }))].filter(year => year !== "");

    // Find the index of Q1 for each year for the timeline
    yearIndices = uniqueQuarters.reduce((acc, q, i) => {
        if (q.endsWith("Q1")) acc.push(i);
        return acc;
    }, []);

    // Compute the maximum revenue value across all data
    maxRevenueValue = d3.max(mergedData, d => d.revenue);

    // Initialize the company filter UI and selectedCompanies
    initializeCompanyFilters(mergedData);

    // Create the timeline and position the triangle on the default quarter
    createTimeline(uniqueQuarters, mergedData, yearIndices, uniqueYears);
    updateTimelineTriangle(currentQuarterIndex); // Position triangle at the default quarter

    // Initialize the charts with the default quarter (2024Q3 or fallback)
    const selectedQuarter = uniqueQuarters[currentQuarterIndex];
    updateBubbleChart(selectedQuarter, mergedData);
    updateBarChart(selectedQuarter, mergedData);
    updateLineCharts(mergedData); // Initialize line charts

}).catch(error => {
    console.error("Error fetching or processing data: ", error);
    d3.select("#charts-container").html("<p>Error loading data. Please try again later.</p>");
});