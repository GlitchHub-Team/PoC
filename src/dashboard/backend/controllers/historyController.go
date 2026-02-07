package controllers

import (
    "gin-test/initializers"
    "gin-test/models"
    "github.com/gin-gonic/gin"
    "net/http"
    "strconv"
)

func HistoryGet(c *gin.Context) {
    tenantQ := c.Query("tenant_id")
    metric := c.Query("metric")
    limitQ := c.DefaultQuery("limit", "1000")

    // Validate required params
    if tenantQ == "" || metric == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "tenant_id and metric are required"})
        return
    }

    tenantID, err := strconv.ParseUint(tenantQ, 10, 32)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid tenant_id"})
        return
    }

    limit, err := strconv.Atoi(limitQ)
    if err != nil || limit <= 0 {
        limit = 1000
    }
    if limit > 10000 {
        limit = 10000 // cap max
    }

    var points []models.Metric
    initializers.DB.
        Where("tenant_id = ?", tenantID).
        Where("metric = ?", metric).
        Order("timestamp asc").
        Limit(limit).
        Find(&points)

    c.JSON(http.StatusOK, points)
}
