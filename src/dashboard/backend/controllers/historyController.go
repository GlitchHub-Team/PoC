package controllers

import (
	"fmt"
	"regexp"

	"gin-test/initializers"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func HistoryGet(c *gin.Context) {
	tenantQ := c.Query("tenant_id")
	metric := c.Query("metric")
	limitQ := c.DefaultQuery("limit", "1000")

	if tenantQ == "" || metric == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "tenant_id and metric are required"})
		return
	}

	tenantID, err := strconv.Atoi(tenantQ)
	if err != nil || tenantID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid tenant_id"})
		return
	}

	validIdent := regexp.MustCompile(`^[a-zA-Z0-9_]+$`)
	if !validIdent.MatchString(metric) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid metric name"})
		return
	}

	limit, err := strconv.Atoi(limitQ)
	if err != nil || limit <= 0 {
		limit = 1000
	}
	if limit > 10000 {
		limit = 10000
	}

	schema := fmt.Sprintf("tenant_%d", tenantID)
	table := metric

	query := fmt.Sprintf("SELECT * FROM %s.%s ORDER BY time ASC LIMIT %d", schema, table, limit)

	rows, err := initializers.DB.Raw(query).Rows()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("query failed: %v", err)})
		return
	}
	defer rows.Close()

	cols, err := rows.Columns()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get columns"})
		return
	}

	// Build result as slice of maps (flexible for dynamic columns)
	var points []map[string]interface{}
	for rows.Next() {
		vals := make([]interface{}, len(cols))
		valPtrs := make([]interface{}, len(cols))
		for i := range cols {
			valPtrs[i] = &vals[i]
		}
		if err := rows.Scan(valPtrs...); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("scan failed: %v", err)})
			return
		}

		entry := make(map[string]interface{})
		for i, col := range cols {
			entry[col] = vals[i]
		}
		points = append(points, entry)
	}

	c.JSON(http.StatusOK, gin.H{"data": points, "count": len(points)})
}
